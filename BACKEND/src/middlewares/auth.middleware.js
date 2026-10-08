const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
    try {
        console.log("AUTH REQUEST:", req.method, req.originalUrl);

        let token = req.cookies?.token;

        // Agar cookie me token nahi hai,
        // Authorization header se token lo
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;

            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        console.log("TOKEN RECEIVED:", !!token);

        if (!token) {
            return res.status(401).json({
                message: "Token not provided"
            });
        }

        const isTokenBlacklisted =
            await tokenBlacklistModel.findOne({
                token
            });

        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: "Token is invalid"
            });
        }

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            console.log("TOKEN VERIFIED:", true);
            console.log("USER:", decoded);

            req.user = decoded;

            next();

        } catch (err) {
            console.log("JWT ERROR:", err.name);
            console.log("JWT MESSAGE:", err.message);

            return res.status(401).json({
                message: "Invalid token"
            });
        }

    } catch (error) {
        console.error("AUTH MIDDLEWARE ERROR:", error);

        return res.status(500).json({
            message: "Authentication failed"
        });
    }
}

module.exports = {
    authUser
};



