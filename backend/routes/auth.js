import express from "express";
import UserModel from "../db/models/User.js";
import { registerSchema, loginSchema } from "../zod/validation.js";
import bcrypt from "bcrypt";
import jwt  from "jsonwebtoken";  
import { protect } from "../middleware/auth.js";

const router = express.Router();


router.post("/register", async(req, res) => {
    try {
        const {success, data} = registerSchema.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ message: data.errors });
        }
        const { name, email, password, role } = data;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await UserModel.create({ name, email, password: hashedPassword, role });
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );
        res.status(200).json({ id: user._id, token: token })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {

        const {success, data} = loginSchema.safeParse(req.body);
        if (!success) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const { email, password } = data;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const salt = await bcrypt.genSalt(10);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
            const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );
        res.status(200).json({ id: user._id, token: token })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/me", protect, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/users", protect, async (req, res) => {
    try {
        const users = await UserModel.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;