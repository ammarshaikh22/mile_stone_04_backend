import jwt from "jsonwebtoken";
import { config } from "dotenv";
import User from "../model/user.model.js";
config();
export const authenticated = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[0];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (user.isLogin === false) {
            return res.status(401).json({ message: "user not login" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
}

