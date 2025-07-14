"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./config/passport"));
const database_1 = __importDefault(require("./config/database"));
// Route imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
const classRoutes_1 = __importDefault(require("./routes/classRoutes"));
const examRoutes_1 = __importDefault(require("./routes/examRoutes"));
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
// Load env vars
dotenv_1.default.config();
// Connect to database
(0, database_1.default)();
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Session middleware (required for OAuth)
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));
// Passport middleware
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/sessions', sessionRoutes_1.default);
app.use('/api/classes', classRoutes_1.default);
app.use('/api/exams', examRoutes_1.default);
app.use('/api/questions', questionRoutes_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Labyrinth API is running' });
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Server Error',
    });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map