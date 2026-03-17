import axios from 'axios';
import FormData from 'form-data';
import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Conversation } from 'typeorm/entities/conversation';
import { Diagnosis } from 'typeorm/entities/diagnosis';
import { Message } from 'typeorm/entities/message';
import { User } from 'typeorm/entities/user';
import { ConversationStatus } from 'typeorm/entities/enum';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { supabase } from 'configs/supabase';
import { AnalyzeRequest } from 'interfaces/analyzeRequest';

import { getIo } from '../../socket/socketInstance';

export const analyzeAiService = async (data: AnalyzeRequest) => {
  const { conversationId, patientId, fileBuffer, fileName, mimeType, fileUrl, description } = data;
  const io = getIo();

  const conversationRepository = getRepository(Conversation);
  const diagnosisRepository = getRepository(Diagnosis);
  const messageRepository = getRepository(Message);
  const userRepository = getRepository(User);

  // 1. Kiểm tra conversation hợp lệ (Cho phép cả bệnh nhân và bác sĩ đã phân công truy cập)
  const conversation = await conversationRepository.findOne({
    where: { id: conversationId },
    relations: ['patient', 'doctor', 'doctor.doctorProfile'],
  });

  if (!conversation) {
    throw new CustomError(404, 'General', 'Không tìm thấy cuộc hội thoại');
  }

  // Kiểm tra quyền: Phải là bệnh nhân hoặc bác sĩ của cuộc hội thoại
  if (conversation.patient?.id !== patientId && conversation.doctor?.id !== patientId) {
    throw new CustomError(403, 'General', 'Bạn không có quyền tham gia cuộc hội thoại này');
  }

  // Nếu cuộc hội thoại đã chuyển sang Bác sĩ tư vấn, AI không tự tiện tham gia nữa
  if (conversation.status === ConversationStatus.DOCTOR_CONSULTING) {
    throw new CustomError(400, 'General', 'Cuộc hội thoại này đã có bác sĩ tham gia. AI sẽ không trả lời nữa.');
  }

  const patient = conversation.patient;

  // 2. Sử dụng URL ảnh đã được upload sẵn qua middleware Supabase
  const imageUrl = fileUrl;

  // 3. Tạo Message kiểu "text" cho bệnh nhân (nếu có description)
  let userTextMessageId = null;
  if (description) {
    const textMessage = new Message();
    textMessage.conversation = conversation;
    if (patient) textMessage.sender = patient;
    textMessage.content = description;
    textMessage.type = 'text';
    textMessage.isAiMessage = false;
    textMessage.timestamp = Date.now();
    await messageRepository.save(textMessage);

    userTextMessageId = textMessage.id;

    if (io) {
      io.to(conversationId).emit('new_message', {
        id: textMessage.id,
        content: textMessage.content,
        type: textMessage.type,
        timestamp: textMessage.timestamp,
        created_at: new Date().toISOString(),
        isAiMessage: textMessage.isAiMessage,
        conversationId: conversation.id,
        sender: {
          id: patient?.id,
          fullName: patient?.fullName,
          role: patient?.role,
        },
      });
    }
  }

  // 3.5. Tạo Message kiểu "image" cho bệnh nhân (Ảnh gốc, nếu có)
  let userImageMessageId = null;
  if (imageUrl) {
    const userMessage = new Message();
    userMessage.conversation = conversation;
    if (patient) userMessage.sender = patient;
    userMessage.content = imageUrl;
    userMessage.type = 'image';
    userMessage.isAiMessage = false;
    userMessage.timestamp = Date.now() + 1; // Đảm bảo nhảy sau text xíu
    await messageRepository.save(userMessage);

    userImageMessageId = userMessage.id;

    // Phát socket tin nhắn của Bệnh nhân ngay
    if (io) {
      io.to(conversationId).emit('new_message', {
        id: userMessage.id,
        content: userMessage.content,
        type: userMessage.type,
        timestamp: userMessage.timestamp,
        created_at: new Date().toISOString(),
        isAiMessage: userMessage.isAiMessage,
        conversationId: conversation.id,
        sender: {
          id: patient?.id,
          fullName: patient?.fullName,
          role: patient?.role,
        },
      });
    }
  }

  // 4. Gửi dữ liệu sang FastAPI AI Server
  const aiServerUrl = process.env.AI_SERVER_URL || 'http://localhost:8000';
  let aiResponse;

  try {
    const formData = new FormData();

    if (fileBuffer && fileName && mimeType) {
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: mimeType,
      });
    }

    if (description) {
      formData.append('description', description);
    }

    const response = await axios.post(`${aiServerUrl}/api/diagnosis/analyze`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000,
    });

    aiResponse = response.data;
  } catch (error: any) {
    console.error('Lỗi gọi AI:', error.message);
    // Nếu AI lỗi, tạo tin nhắn lỗi từ AI
    const errorMsg = new Message();
    errorMsg.conversation = conversation;
    errorMsg.content = 'Xin lỗi, hệ thống AI đang bận hoặc quá tải. Vui lòng thử lại sau.';
    errorMsg.type = 'text';
    errorMsg.isAiMessage = true;
    errorMsg.timestamp = Date.now();
    await messageRepository.save(errorMsg);

    if (io) {
      io.to(conversationId).emit('new_message', {
        id: errorMsg.id,
        content: errorMsg.content,
        type: errorMsg.type,
        timestamp: errorMsg.timestamp,
        created_at: new Date().toISOString(),
        isAiMessage: true,
        conversationId: conversation.id,
      });
    }
    throw new CustomError(500, 'General', 'Lỗi phân tích AI.');
  }

  // 5. Lưu Diagnosis vào DB
  const diagnosis = new Diagnosis();
  diagnosis.AIResult = aiResponse.disease_name;
  diagnosis.AIConfidence = aiResponse.confidence;
  diagnosis.specialization = aiResponse.specialization;
  diagnosis.patient = patient as any; // Dùng instance từ db thay vì {id}
  diagnosis.conversation = conversation;

  await diagnosisRepository.save(diagnosis);

  // 6. Xử lý ảnh khoanh vùng (Processed Image)
  let processedImageUrl = null;
  if (aiResponse.processed_image) {
    try {
      console.log('[AI Service] Processing segmentation image...');
      const buffer = Buffer.from(aiResponse.processed_image, 'base64');
      const processedFileName = `${patientId}/${Date.now()}_processed_${uuidv4()}.jpg`;

      const { error: uploadError } = await supabase.storage.from('disease_picture').upload(processedFileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

      if (uploadError) {
        console.error('[AI Service] Supabase upload error:', uploadError);
      } else {
        const { data } = supabase.storage.from('disease_picture').getPublicUrl(processedFileName);
        processedImageUrl = data.publicUrl;
        console.log('[AI Service] Processed image uploaded:', processedImageUrl);

        // Tạo tin nhắn AI gửi ảnh khoanh vùng
        const aiImageMsg = new Message();
        aiImageMsg.conversation = conversation;
        aiImageMsg.content = processedImageUrl;
        aiImageMsg.type = 'image';
        aiImageMsg.isAiMessage = true;
        aiImageMsg.timestamp = Date.now() + 1; // Nhích nhẹ timestamp để đứng sau ảnh user
        await messageRepository.save(aiImageMsg);

        if (io) {
          io.to(conversationId).emit('new_message', {
            id: aiImageMsg.id,
            content: aiImageMsg.content,
            type: aiImageMsg.type,
            timestamp: aiImageMsg.timestamp,
            created_at: new Date().toISOString(),
            isAiMessage: true,
            conversationId: conversation.id,
            sender: { id: 'dara', fullName: 'DARA AI', role: 'AI' },
          });
        }
      }
    } catch (err) {
      console.error('[AI Service] Lỗi khi xử lý ảnh khoanh vùng:', err);
    }
  }

  // 7. Cập nhật thông tin chẩn đoán và TITLE cho conversation
  conversation.diagnosisInfo = {
    diseaseName: aiResponse.disease_name,
    confidence: aiResponse.confidence,
    specialization: aiResponse.specialization,
    severity: aiResponse.severity,
    description: aiResponse.description,
    recommendations: aiResponse.recommendations,
    processedImageUrl: processedImageUrl, // Lưu cả URL ảnh khoanh vùng vào info
  };

  // Tự động đặt tên hội thoại theo tên bệnh nếu nó mới khởi tạo
  if (!conversation.title || conversation.title === 'Cuộc hội thoại mới') {
    conversation.title = `Tư vấn: ${aiResponse.disease_name}`;
  }

  await conversationRepository.save(conversation);

  // 8. Tạo Message từ AI báo kết quả (Text)
  const aiMessage = new Message();
  aiMessage.conversation = conversation;

  // Nếu chỉ có text (không có ảnh) và mức độ tin cậy < 50%, thì ẩn 3 dòng header đi
  if (!fileUrl && aiResponse.confidence <= 0.5) {
    aiMessage.content = `*${aiResponse.description}*\n\nKhuyến nghị:\n- ${aiResponse.recommendations.join('\n- ')}`;
  } else {
    aiMessage.content = `DARA AI chẩn đoán sơ bộ: **${aiResponse.disease_name}**\nMức độ tin cậy: **${(
      aiResponse.confidence * 100
    ).toFixed(1)}%**\nChuyên khoa: ${aiResponse.specialization}\n\n*${
      aiResponse.description
    }*\n\nKhuyến nghị:\n- ${aiResponse.recommendations.join('\n- ')}\n\n${
      aiResponse.should_see_doctor
        ? '👉 **Hệ thống khuyên bạn nên đặt lịch với bác sĩ chuyên khoa da liễu để thăm khám chi tiết.**'
        : ''
    }`;
  }

  aiMessage.type = 'text';
  aiMessage.isAiMessage = true;
  aiMessage.timestamp = Date.now() + 2;
  await messageRepository.save(aiMessage);

  // Phát socket tin nhắn của AI
  if (io) {
    io.to(conversationId).emit('new_message', {
      id: aiMessage.id,
      content: aiMessage.content,
      type: aiMessage.type,
      timestamp: aiMessage.timestamp,
      created_at: new Date().toISOString(),
      isAiMessage: true,
      conversationId: conversation.id,
      sender: { id: 'dara', fullName: 'DARA AI', role: 'AI' },
    });
  }

  // 9. Notify Patient
  try {
    const { createNotificationsService } = await import('../notifications/createNotificationsService');
    await createNotificationsService(
      'Kết quả phân tích AI',
      `Kết quả chẩn đoán sơ bộ cho hình ảnh của bạn đã có: ${aiResponse.disease_name}.`,
      'NOTI_AI_RESULT',
      diagnosis.id,
      patientId,
    );
  } catch (notiErr) {
    console.error('Error creating notification for AI analysis:', notiErr);
  }

  return {
    diagnosisId: diagnosis.id,
    messageId: userImageMessageId || userTextMessageId,
    aiResult: aiResponse,
    imageUrl,
    processedImageUrl,
  };
};
