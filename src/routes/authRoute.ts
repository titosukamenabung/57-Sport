import express from "express";
import {
  register,
  login,
  profile,
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, profile);

export default router;