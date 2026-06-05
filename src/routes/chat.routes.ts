import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import { postMessageSchema, getSessionSchema } from '../validators/chat.validator';

const router = Router();
const chatController = new ChatController();

// POST /api/chat/message
router.post(
  '/message',
  validateBody(postMessageSchema),
  chatController.sendMessage
);

// GET /api/chat/:sessionId
router.get(
  '/:sessionId',
  validateParams(getSessionSchema),
  chatController.getConversation
);

export default router;
