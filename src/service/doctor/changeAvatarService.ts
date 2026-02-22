import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { supabase } from 'configs/supabase';
import { Doctor } from 'typeorm/entities/doctor';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const changeAvatarService = async (id: string, file: Express.Multer.File) => {
  try {
    const doctorRepository = getRepository(Doctor);
    const doctor = await doctorRepository.findOne({ where: { user_id: id } });

    if (!doctor) {
      throw new CustomError(404, 'General', 'Doctor not found');
    }

    // Create a unique file name
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${id}-${uuidv4()}.${fileExtension}`;

    // Upload the file buffer to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError);
      throw new CustomError(500, 'Raw', 'Failed to upload avatar to Supabase', null, uploadError);
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // Update the doctor's avatar field in the database
    doctor.avatar = publicUrl;
    await doctorRepository.save(doctor);

    return doctor;
  } catch (error) {
    throw error;
  }
};
