import { getRepository } from 'typeorm';

import { Appointment } from '../../database/entities/appointment';
import { Conversation } from '../../database/entities/conversation';
import { Diagnosis } from '../../database/entities/diagnosis';
import { MedicalRecord } from '../../database/entities/medicalRecord';
import { Message } from '../../database/entities/message';
import { CreateMedicalRecordDto } from '../../interfaces/medicalRecord';
import { getIo } from '../../socket/socketInstance';

export const createMedicalRecordService = async (data: CreateMedicalRecordDto) => {
  const medicalRecordRepo = getRepository(MedicalRecord);
  const appointmentRepo = getRepository(Appointment);
  const conversationRepo = getRepository(Conversation);
  const messageRepo = getRepository(Message);
  const diagnosisRepo = getRepository(Diagnosis);

  const appointment = await appointmentRepo.findOne(data.appointmentId, {
    relations: ['patient', 'doctor'],
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  const conversation = await conversationRepo.findOne({
    where: { appointment: { id: data.appointmentId } },
  });

  const diagnosis = await diagnosisRepo.findOne({
    where: { appointment: { id: data.appointmentId } },
  });
  const medicalRecord = new MedicalRecord();
  medicalRecord.appointment = appointment;
  medicalRecord.patient = appointment.patient;
  medicalRecord.doctor = appointment.doctor;
  medicalRecord.diagnosis = diagnosis || null;
  medicalRecord.treatment = data.treatment;
  medicalRecord.note = data.note;
  medicalRecord.images = data.images;
  medicalRecord.patientInfo = data.patientInfo;
  medicalRecord.doctorInfo = data.doctorInfo;

  const savedRecord = await medicalRecordRepo.save(medicalRecord);

  if (conversation) {
    const recordMessage = messageRepo.create({
      conversation,
      sender: appointment.doctor,
      content: JSON.stringify({
        recordId: savedRecord.id,
        treatment: savedRecord.treatment,
        note: savedRecord.note,
        images: savedRecord.images,
      }),
      type: 'medical_record',
      timestamp: Date.now(),
      isAiMessage: false,
    });

    await messageRepo.save(recordMessage);

    const io = getIo();
    if (io) {
      const payload = {
        id: recordMessage.id,
        content: recordMessage.content,
        type: recordMessage.type,
        timestamp: recordMessage.timestamp,
        created_at: recordMessage.created_at,
        conversationId: conversation.id,
        isAiMessage: false,
        sender: {
          id: appointment.doctor.id,
          fullName: appointment.doctor.fullName,
          role: appointment.doctor.role,
        },
      };
      io.to(conversation.id).emit('new_message', payload);
      if (appointment.patient?.id) {
        io.to(`user_${appointment.patient.id}`).emit('new_message', payload);
      }
    }
  }

  return savedRecord;
};
