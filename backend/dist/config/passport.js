"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_1 = __importDefault(require("../models/User"));
// Serialize and deserialize user
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await User_1.default.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
// Google OAuth Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        let user = await User_1.default.findOne({ googleId: profile.id });
        if (!user) {
            // Check if user exists with email
            user = await User_1.default.findOne({ email: profile.emails?.[0]?.value });
            if (user) {
                // Link Google account to existing user
                user.googleId = profile.id;
                await user.save();
            }
            else {
                // Create new user
                user = await User_1.default.create({
                    googleId: profile.id,
                    email: profile.emails?.[0]?.value,
                    name: profile.displayName,
                    role: 'admin',
                });
            }
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, undefined);
    }
}));
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map