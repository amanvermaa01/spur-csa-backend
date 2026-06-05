"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class ConversationRepository {
    async create() {
        return prisma_1.default.conversation.create({
            data: {},
        });
    }
    async findById(id) {
        return prisma_1.default.conversation.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
    }
    async exists(id) {
        const count = await prisma_1.default.conversation.count({
            where: { id },
        });
        return count > 0;
    }
}
exports.ConversationRepository = ConversationRepository;
