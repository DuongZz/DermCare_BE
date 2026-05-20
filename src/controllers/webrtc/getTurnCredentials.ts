import axios from 'axios';
import { Request, Response } from 'express';

/**
 * Proxy endpoint để FE lấy TURN credentials từ Metered.ca API
 * Giúp ẩn API key khỏi client-side code
 *
 * Nếu chưa có METERED_API_KEY, trả về fallback credentials (openrelay)
 */
export const getTurnCredentials = async (_req: Request, res: Response) => {
  const apiKey = process.env.METERED_API_KEY;

  if (!apiKey) {
    // Fallback: dùng OpenRelay public credentials (có thể bị rate-limit)
    console.warn('[TURN] METERED_API_KEY chưa được cấu hình, dùng fallback credentials');
    return res.json({
      success: true,
      data: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turns:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
      ],
    });
  }

  try {
    const appName = process.env.METERED_APP_NAME || 'dermcare';
    const { data: iceServers } = await axios.get(
      `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`,
    );
    return res.json({ success: true, data: iceServers });
  } catch (error: any) {
    console.error('[TURN] Failed to fetch credentials from Metered:', error.message);
    // Fallback on error
    return res.json({
      success: true,
      data: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }],
    });
  }
};
