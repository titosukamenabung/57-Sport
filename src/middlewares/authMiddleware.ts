import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Unauthenticated. Token tidak ditemukan",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthenticated. Format token tidak valid",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }
};