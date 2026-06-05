"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const chat_validator_1 = require("../validators/chat.validator");
const router = (0, express_1.Router)();
const chatController = new chat_controller_1.ChatController();
// POST /api/chat/message
router.post('/message', (0, validation_middleware_1.validateBody)(chat_validator_1.postMessageSchema), chatController.sendMessage);
// GET /api/chat/:sessionId
router.get('/:sessionId', (0, validation_middleware_1.validateParams)(chat_validator_1.getSessionSchema), chatController.getConversation);
exports.default = router;
