import express from "express";
import {
  register,
  login,
  profile,
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth routes available", endpoints: ["/register", "/login", "/profile"] });
});

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, profile);

export default router;