import { Request, Response } from "express";
import { prisma } from "../lib/db.js";

// Menampilkan semua kriteria
export const getKriterias = async (req: Request, res: Response) => {
  try {
    const kriterias = await prisma.kriteria.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json(kriterias);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data kriteria",
      error,
    });
  }
};

// Menambahkan kriteria
export const createKriteria = async (req: Request, res: Response) => {
  try {
    const {
      kode,
      namaKriteria,
      atribut,
      bobotDefault,
    } = req.body;

    if (!kode || !namaKriteria || !atribut || !bobotDefault) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    const checkKode = await prisma.kriteria.findFirst({
      where: {
        kode,
      },
    });

    if (checkKode) {
      return res.status(400).json({
        message: "Kode kriteria sudah digunakan",
      });
    }

    const kriteria = await prisma.kriteria.create({
      data: {
        kode,
        namaKriteria,
        atribut,
        bobotDefault: Number(bobotDefault),
      },
    });

    res.status(201).json({
      message: "Kriteria berhasil ditambahkan",
      kriteria,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menambahkan kriteria",
      error,
    });
  }
};

// Menampilkan detail kriteria
export const showKriteria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const kriteria = await prisma.kriteria.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!kriteria) {
      return res.status(404).json({
        message: "Kriteria tidak ditemukan",
      });
    }

    res.json(kriteria);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail kriteria",
      error,
    });
  }
};

// Mengupdate kriteria
export const updateKriteria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      kode,
      namaKriteria,
      atribut,
      bobotDefault,
    } = req.body;

    const checkKriteria = await prisma.kriteria.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!checkKriteria) {
      return res.status(404).json({
        message: "Kriteria tidak ditemukan",
      });
    }

    const kriteria = await prisma.kriteria.update({
      where: {
        id: Number(id),
      },
      data: {
        kode,
        namaKriteria,
        atribut,
        bobotDefault: Number(bobotDefault),
      },
    });

    res.json({
      message: "Kriteria berhasil diupdate",
      kriteria,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengupdate kriteria",
      error,
    });
  }
};

// Menghapus kriteria
export const deleteKriteria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const checkKriteria = await prisma.kriteria.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!checkKriteria) {
      return res.status(404).json({
        message: "Kriteria tidak ditemukan",
      });
    }

    await prisma.kriteria.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({
      message: "Kriteria berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus kriteria",
      error,
    });
  }
};