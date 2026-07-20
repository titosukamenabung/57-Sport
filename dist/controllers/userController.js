import { prisma } from "../lib/db.js";
import bcrypt from "bcrypt";
// Menampilkan semua user
export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                nama: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal mengambil data user",
            error,
        });
    }
};
// Menambahkan user
export const createUser = async (req, res) => {
    try {
        const { nama, email, password, role } = req.body;
        if (!nama || !email || !password || !role) {
            return res.status(400).json({
                message: "Semua field wajib diisi",
            });
        }
        const checkUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (checkUser) {
            return res.status(400).json({
                message: "Email sudah digunakan",
            });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                nama,
                email,
                password: hashPassword,
                role,
            },
        });
        res.status(201).json({
            message: "User berhasil ditambahkan",
            user,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal menambahkan user",
            error,
        });
    }
};
// Menampilkan detail user
export const showUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id),
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
        res.json(user);
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal mengambil detail user",
            error,
        });
    }
};
// Mengupdate user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, email, role } = req.body;
        const user = await prisma.user.update({
            where: {
                id: Number(id),
            },
            data: {
                nama,
                email,
                role,
            },
        });
        res.json({
            message: "User berhasil diupdate",
            user,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal mengupdate user",
            error,
        });
    }
};
// Menghapus user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: {
                id: Number(id),
            },
        });
        res.json({
            message: "User berhasil dihapus",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal menghapus user",
            error,
        });
    }
};
//# sourceMappingURL=userController.js.map