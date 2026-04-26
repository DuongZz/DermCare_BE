import { Request, Response, NextFunction } from 'express';

export const getLanguage = (req: Request, res: Response, next: NextFunction) => {
  let language = req.header('Accept-Language') || 'vi';

  // Normalize language (support vi-VN, en-US, etc.)
  if (language.toLowerCase().startsWith('en')) {
    language = 'en';
  } else {
    language = 'vi';
  }

  // Use global Request augmentation correctly
  req.language = language;
  next();
};
