"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: '*', // For development flexibility, can lock down to frontend origin later
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
app.use(express_1.default.json());
// Routes
app.use('/api/chat', chat_routes_1.default);
app.use('/chat', chat_routes_1.default);
// Unmatched route handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Error handling middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
