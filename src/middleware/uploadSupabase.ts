import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { supabase } from 'configs/supabase';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const uploadToSupabase = (bucketName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(); // Bỏ qua nếu không có file
    }

    try {
      // Lấy id người dùng để chia folder trên Supabase (giúp dễ quản lý data)
      const userId = req.jwtPayload?.id || 'public';

      const file = req.file;
      const fileExt = file.originalname.split('.').pop() || 'jpg';

      // Tạo đường dẫn file: userId/timestamp_uuid.ext
      const fileName = `${userId}/${Date.now()}_${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

      if (uploadError) {
        console.error('Supabase Upload Middleware Error:', uploadError);
        throw new CustomError(500, 'Raw', 'Lỗi khi upload ảnh lên Supabase', null, uploadError);
      }

      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);

      // Gắn public URL vào object request để các Controller có thể dùng
      (req as any).fileUrl = publicUrlData.publicUrl;

      next();
    } catch (error) {
      next(error);
    }
  };
};
