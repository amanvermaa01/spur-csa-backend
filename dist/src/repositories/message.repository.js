"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class MessageRepository {
    async create(conversationId, sender, content) {
        return prisma_1.default.message.create({
            data: {
                conversationId,
                sender,
                content,
            },
        });
    }
    async findRecentByConversationId(conversationId, limit) {
        const messages = await prisma_1.default.message.findMany({
            where: { conversationId },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });
        // Return in chronological order (oldest to newest)
        return messages.reverse();
    }
}
exports.MessageRepository = MessageRepository;
