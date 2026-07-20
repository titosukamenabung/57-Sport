import express from "express";
import { getMotors, createMotor, showMotor, updateMotor, deleteMotor, } from "../controllers/motorController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
const router = express.Router();
router.get("/", getMotors);
router.post("/", authenticate, createMotor);
router.get("/:id", showMotor);
router.put("/:id", authenticate, updateMotor);
router.delete("/:id", authenticate, deleteMotor);
export default router;
//# sourceMappingURL=motorRoute.js.map