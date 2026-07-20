import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getRecommendations,
  getMyHistory,
  createRecommendationRequest,
  showRecommendation,
  calculateRecommendation,
  deleteRecommendation,
  calculateManualRecommendation,
} from "../controllers/recommendationController.js";



const router = express.Router();

router.get("/", authenticate, getRecommendations);

router.get("/my-history", authenticate, getMyHistory);

router.post("/", authenticate, createRecommendationRequest);

router.get("/:requestId", authenticate, showRecommendation);

router.post(
  "/:requestId/calculate",
  authenticate,
  calculateRecommendation
);

router.delete(
  "/:requestId",
  authenticate,
  deleteRecommendation
);

router.post("/manual", calculateManualRecommendation);

export default router;