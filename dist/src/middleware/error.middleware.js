"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('[Unhandled Server Error]:', error);
    // Return a safe error message without leaking stack traces or internal secrets
    res.status(500).json({
        error: 'An unexpected error occurred on the server. Please try again later.',
    });
};
exports.errorHandler = errorHandler;
