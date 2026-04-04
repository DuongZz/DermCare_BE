import { Request, Response, NextFunction } from 'express';

import { createMedicalRecordService } from '../../service/medicalRecords/createMedicalRecordService';
import { CustomSuccess } from '../../utils/response/custom-success/customSuccess';

export const createMedicalRecordController = async (req: Request, res: Response, next: NextFunction) => {
  const doctorId = (req as any).jwtPayload?.id;
  const { appointmentId, treatment, note, images, patientInfo, doctorInfo } = req.body;

  try {
    const record = await createMedicalRecordService({
      appointmentId,
      doctorId,
      treatment,
      note,
      images,
      patientInfo,
      doctorInfo,
    });

    return res.customSuccess(201, 'Medical record created successfully', record);
  } catch (err) {
    return next(err);
  }
};
