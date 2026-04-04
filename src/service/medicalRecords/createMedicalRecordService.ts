import { getRepository } from 'typeorm';

import { CreateMedicalRecordDto } from '../../interfaces/medicalRecord';
import { getIo } from '../../socket/socketInstance';
import { Appointment } from '../../typeorm/entities/appointment';
import { Conversation } from '../../typeorm/entities/conversation';
import { Diagnosis } from '../../typeorm/entities/diagnosis';
import { MedicalRecord } from '../../typeorm/entities/medicalRecord';
import { Message } from '../../typeorm/entities/message';

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
      io.to(conversation.id).emit('new_message', {
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
      });
    }
  }

  return savedRecord;
};
