import { prisma } from "../lib/db.js";
// Menampilkan semua motor
export const getMotors = async (req, res) => {
    try {
        const motors = await prisma.motor.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                merk: true,
                user: {
                    select: {
                        id: true,
                        nama: true,
                        email: true,
                    },
                },
            },
        });
        res.json(motors);
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal mengambil data motor",
            error,
        });
    }
};
// Menambahkan motor
export const createMotor = async (req, res) => {
    try {
        const { namaMotor, tipe, warna, transmisi, deskripsi, foto, status, harga, cc, tahunMotor, efisiensiBbm, masaPajakStnk, kondisiFisik, userId, merkId, } = req.body;
        const motor = await prisma.motor.create({
            data: {
                namaMotor,
                tipe,
                warna,
                transmisi,
                deskripsi,
                foto,
                status,
                harga: Number(harga),
                cc: Number(cc),
                tahunMotor: Number(tahunMotor),
                efisiensiBbm: Number(efisiensiBbm),
                masaPajakStnk: Number(masaPajakStnk),
                kondisiFisik: Number(kondisiFisik),
                userId: Number(userId),
                merkId: Number(merkId),
            },
        });
        res.status(201).json({
            message: "Motor berhasil ditambahkan",
            motor,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal menambahkan motor",
            error,
        });
    }
};
// Menampilkan detail motor
export const showMotor = async (req, res) => {
    try {
        const { id } = req.params;
        const motor = await prisma.motor.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                merk: true,
                user: {
                    select: {
                        id: true,
                        nama: true,
                        email: true,
                    },
                },
            },
        });
        if (!motor) {
            return res.status(404).json({
                message: "Motor tidak ditemukan",
            });
        }
        res.json(motor);
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal mengambil detail motor",
            error,
        });
    }
};
// Mengupdate motor
export const updateMotor = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaMotor, tipe, warna, transmisi, deskripsi, foto, status, harga, cc, tahunMotor, efisiensiBbm, masaPajakStnk, kondisiFisik, userId, merkId, } = req.body;
        const checkMotor = await prisma.motor.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!checkMotor) {
            return res.status(404).json({
                message: "Motor tidak ditemukan",
            });
        }
        const dataUpdate = {};
        if (namaMotor !== undefined)
            dataUpdate.namaMotor = namaMotor;
        if (tipe !== undefined)
            dataUpdate.tipe = tipe;
        if (warna !== undefined)
            dataUpdate.warna = warna;
        if (transmisi !== undefined)
            dataUpdate.transmisi = transmisi;
        if (deskripsi !== undefined)
            dataUpdate.deskripsi = deskripsi;
        if (foto !== undefined)
            dataUpdate.foto = foto;
        if (status !== undefined)
            dataUpdate.status = status;
        if (harga !== undefined)
            dataUpdate.harga = Number(harga);
        if (cc !== undefined)
            dataUpdate.cc = Number(cc);
        if (tahunMotor !== undefined)
            dataUpdate.tahunMotor = Number(tahunMotor);
        if (efisiensiBbm !== undefined)
            dataUpdate.efisiensiBbm = Number(efisiensiBbm);
        if (masaPajakStnk !== undefined)
            dataUpdate.masaPajakStnk = Number(masaPajakStnk);
        if (kondisiFisik !== undefined)
            dataUpdate.kondisiFisik = Number(kondisiFisik);
        if (userId !== undefined)
            dataUpdate.userId = Number(userId);
        if (merkId !== undefined)
            dataUpdate.merkId = Number(merkId);
        if (Object.keys(dataUpdate).length === 0) {
            return res.status(400).json({
                message: "Tidak ada field yang diupdate",
            });
        }
        const motor = await prisma.motor.update({
            where: {
                id: Number(id),
            },
            data: dataUpdate,
        });
        res.json({
            message: "Motor berhasil diupdate",
            motor,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal mengupdate motor",
            error,
        });
    }
};
// Menghapus motor
export const deleteMotor = async (req, res) => {
    try {
        const { id } = req.params;
        const checkMotor = await prisma.motor.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!checkMotor) {
            return res.status(404).json({
                message: "Motor tidak ditemukan",
            });
        }
        await prisma.motor.delete({
            where: {
                id: Number(id),
            },
        });
        res.json({
            message: "Motor berhasil dihapus",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Gagal menghapus motor",
            error,
        });
    }
};
//# sourceMappingURL=motorController.js.map