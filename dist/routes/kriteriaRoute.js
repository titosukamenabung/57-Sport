import express from "express";
import { getKriterias, createKriteria, showKriteria, updateKriteria, deleteKriteria, } from "../controllers/kriteriaController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
const router = express.Router();
router.get("/", getKriterias);
router.post("/", authenticate, createKriteria);
router.get("/:id", showKriteria);
router.put("/:id", authenticate, updateKriteria);
router.delete("/:id", authenticate, deleteKriteria);
export default router;
//# sourceMappingURL=kriteriaRoute.js.map