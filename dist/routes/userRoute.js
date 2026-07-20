import express from "express";
import { getUsers, createUser, showUser, updateUser, deleteUser, } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
const router = express.Router();
router.get("/", authenticate, getUsers);
router.post("/", authenticate, createUser);
router.get("/:id", authenticate, showUser);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);
export default router;
//# sourceMappingURL=userRoute.js.map