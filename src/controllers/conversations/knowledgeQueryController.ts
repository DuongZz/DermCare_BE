import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

export const knowledgeQueryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question } = req.body;
    const aiServerUrl = process.env.AI_SERVER_URL || 'http://localhost:8000';

    if (!question) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp câu hỏi.' });
    }

    console.log(`[BE Proxy] Querying knowledge base: ${question}`);

    const response = await axios.post(
      `${aiServerUrl}/api/knowledge/query`,
      {
        question,
      },
      {
        timeout: 30000,
      },
    );

    console.log(`[BE Proxy] AI Server response:`, response.data);

    return res.status(200).json({
      success: true,
      message: 'Truy vấn kiến thức thành công',
      data: response.data,
    });
  } catch (error: any) {
    console.error('API /knowledge/query Proxy Error:', error.message);
    if (error.response) {
      console.error('AI Server Error Data:', error.response.data);
      console.error('AI Server Error Status:', error.response.status);
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi gọi AI Server',
      error: error.message,
    });
  }
};
