import express from "express";
import { getMerks, createMerk, showMerk, updateMerk, deleteMerk, } from "../controllers/merkController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
const router = express.Router();
router.get("/", getMerks);
router.post("/", authenticate, createMerk);
router.get("/:id", showMerk);
router.put("/:id", authenticate, updateMerk);
router.delete("/:id", authenticate, deleteMerk);
export default router;
//# sourceMappingURL=merkRoute.js.map