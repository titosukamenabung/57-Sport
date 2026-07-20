import { prisma } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// =========================
// REGISTER
// =========================
export const register = async (req, res) => {
    try {
        const { nama, email, password, role } = req.body;
        if (!nama || !email || !password || !role) {
            return res.status(400).json({
                message: "Nama, email, password, dan role wajib diisi",
            });
        }
        if (role !== "admin" && role !== "customer") {
            return res.status(400).json({
                message: "Role harus admin atau customer",
            });
        }
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (existingUser) {
            return res.status(409).json({
                message: "Email sudah digunakan",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                nama,
                email,
                password: hashedPassword,
                role,
            },
        });
        return res.status(201).json({
            message: "Register berhasil",
            data: {
                id: newUser.id,
                nama: newUser.nama,
                email: newUser.email,
                role: newUser.role,
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Terjadi kesalahan server",
            error,
        });
    }
};
// =========================
// LOGIN
// =========================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email dan password wajib diisi",
            });
        }
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            return res.status(401).json({
                message: "Email atau password salah",
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Email atau password salah",
            });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                message: "JWT_SECRET belum diatur di file .env",
            });
        }
        const token = jwt.sign({
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role,
        }, jwtSecret, {
            expiresIn: "1d",
        });
        return res.status(200).json({
            message: "Login berhasil",
            token,
            data: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Terjadi kesalahan server",
            error,
        });
    }
};
// =========================
// PROFILE
// =========================
export const profile = async (req, res) => {
    try {
        const id = Number(req.user.id);
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                nama: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan",
            });
        }
        return res.status(200).json({
            message: "Berhasil mengambil profile",
            data: user,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Terjadi kesalahan server",
            error,
        });
    }
};
// =========================
// CHANGE PASSWORD
// =========================
export const changePassword = async (req, res) => {
    try {
        const id = Number(req.user.id);
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "Password lama dan password baru wajib diisi",
            });
        }
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
        });
        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan",
            });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Password lama salah",
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: {
                id,
            },
            data: {
                password: hashedPassword,
            },
        });
        return res.status(200).json({
            message: "Password berhasil diubah",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Terjadi kesalahan server",
            error,
        });
    }
};
// =========================
// LOGOUT
// =========================
export const logout = async (req, res) => {
    try {
        return res.status(200).json({
            message: "Logout berhasil",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Terjadi kesalahan server",
            error,
        });
    }
};
//# sourceMappingURL=authController.js.map