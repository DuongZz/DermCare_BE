import { Router } from 'express';

import { getTurnCredentials } from '../../controllers/webrtc';
import { checkJwt } from '../../middleware/checkJwt';

const router = Router();

// GET /v1/webrtc/turn-credentials — Lấy TURN server credentials (cần auth)
router.get('/turn-credentials', [checkJwt], getTurnCredentials);

export default router;
