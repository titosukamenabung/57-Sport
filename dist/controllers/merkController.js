import { prisma } from "../lib/db.js";
// Menampilkan semua merk
export const getMerks = async (req, res) => {
    try {
        const merks = await prisma.merk.findMany({
            orderBy: {
                id: "desc",
            },
        });
        res.json(merks);
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal mengambil data merk",
            error,
        });
    }
};
// Menambahkan merk
export const createMerk = async (req, res) => {
    try {
        const { namaMerk } = req.body;
        if (!namaMerk) {
            return res.status(400).json({
                message: "Nama merk wajib diisi",
            });
        }
        const checkMerk = await prisma.merk.findFirst({
            where: {
                namaMerk,
            },
        });
        if (checkMerk) {
            return res.status(400).json({
                message: "Merk sudah tersedia",
            });
        }
        const merk = await prisma.merk.create({
            data: {
                namaMerk,
            },
        });
        res.status(201).json({
            message: "Merk berhasil ditambahkan",
            merk,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal menambahkan merk",
            error,
        });
    }
};
// Menampilkan detail merk
export const showMerk = async (req, res) => {
    try {
        const { id } = req.params;
        const merk = await prisma.merk.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!merk) {
            return res.status(404).json({
                message: "Merk tidak ditemukan",
            });
        }
        res.json(merk);
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal mengambil detail merk",
            error,
        });
    }
};
// Mengupdate merk
export const updateMerk = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaMerk } = req.body;
        const checkMerk = await prisma.merk.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!checkMerk) {
            return res.status(404).json({
                message: "Merk tidak ditemukan",
            });
        }
        const merk = await prisma.merk.update({
            where: {
                id: Number(id),
            },
            data: {
                namaMerk,
            },
        });
        res.json({
            message: "Merk berhasil diupdate",
            merk,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal mengupdate merk",
            error,
        });
    }
};
// Menghapus merk
export const deleteMerk = async (req, res) => {
    try {
        const { id } = req.params;
        const checkMerk = await prisma.merk.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!checkMerk) {
            return res.status(404).json({
                message: "Merk tidak ditemukan",
            });
        }
        await prisma.merk.delete({
            where: {
                id: Number(id),
            },
        });
        res.json({
            message: "Merk berhasil dihapus",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal menghapus merk",
            error,
        });
    }
};
//# sourceMappingURL=merkController.js.map