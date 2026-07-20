import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
import { calculateTOPSIS, calculateManualTOPSIS } from "../services/topsisService.js";

// ======================================
// GET ALL RECOMMENDATIONS
// ======================================
export const getRecommendations = async (
  req: Request,
  res: Response
) => {
  try {
    const recommendations = await prisma.recommendationRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        weights: {
          include: {
            kriteria: true,
          },
        },
        results: {
          include: {
            motor: {
              include: {
                merk: true,
              },
            },
          },
          orderBy: {
            ranking: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Berhasil mengambil data rekomendasi",
      data: recommendations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

export const getMyHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number((req as any).user.id);

    const histories =
      await prisma.recommendationRequest.findMany({
        where: {
          userId,
        },
        include: {
          results: {
            include: {
              motor: {
                include: {
                  merk: true,
                },
              },
            },
            orderBy: {
              ranking: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      message: "Berhasil mengambil riwayat",
      data: histories,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Gagal mengambil riwayat",
      error,
    });

  }
};

// ======================================
// CREATE REQUEST
// ======================================
export const createRecommendationRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId, bobot } = req.body;

    if (!userId || !Array.isArray(bobot)) {
      return res.status(400).json({
        message: "Data request tidak lengkap",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const request = await prisma.recommendationRequest.create({
      data: {
        metode: "topsis",
        userId: Number(userId),
      },
    });

    await prisma.requestWeight.createMany({
      data: bobot.map((item: any) => ({
        requestId: request.id,
        kriteriaId: item.kriteriaId,
        bobot: Number(item.bobot),
      })),
    });

    return res.status(201).json({
      message: "Request rekomendasi berhasil dibuat",
      data: request,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal membuat request",
    });
  }
};

// ======================================
// DETAIL REQUEST
// ======================================
export const showRecommendation = async (
  req: Request,
  res: Response
) => {
  try {
    const { requestId } = req.params;

    const recommendation = await prisma.recommendationRequest.findUnique({
      where: {
        id: Number(requestId),
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        weights: {
          include: {
            kriteria: true,
          },
        },
        results: {
          include: {
            motor: {
              include: {
                merk: true,
              },
            },
          },
          orderBy: {
            ranking: "asc",
          },
        },
      },
    });

    if (!recommendation) {
      return res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Berhasil",
      data: recommendation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

// ======================================
// CALCULATE TOPSIS
// ======================================
export const calculateRecommendation = async (
  req: Request,
  res: Response
) => {
  try {
    const { requestId } = req.params;
    const preferences = req.body?.preferences ?? null;

    if (!preferences) {
      return res.status(400).json({
        message: "Preferences harus dikirim.",
      });
    }

    const request = await prisma.recommendationRequest.findUnique({
      where: {
        id: Number(requestId),
      },
    });

    if (!request) {
      return res.status(404).json({
        message: "Request tidak ditemukan",
      });
    }

    const result = await calculateTOPSIS(Number(requestId), preferences);

    return res.status(200).json({
      message: "Perhitungan TOPSIS berhasil",
      data: result,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message || "Gagal menghitung TOPSIS",
    });
  }
};

// ======================================
// CALCULATE MANUAL TOPSIS (5 Selected Motors)
// ======================================
export const calculateManualRecommendation = async (
  req: Request,
  res: Response
) => {
  try {
    const { motorIds, weights } = req.body;

    if (!Array.isArray(motorIds)) {
      return res.status(400).json({
        message: "Data motorIds harus berupa array",
      });
    }

    if (motorIds.length < 2) {
      return res.status(400).json({
        message: "Minimal pilih 2 motor untuk perbandingan",
      });
    }

    if (motorIds.length > 5) {
      return res.status(400).json({
        message: "Maksimal 5 motor dapat dibandingkan",
      });
    }

    const uniqueIds = [...new Set(motorIds)];
    if (uniqueIds.length !== motorIds.length) {
      return res.status(400).json({
        message: "Tidak boleh ada ID motor yang duplikat",
      });
    }

    const numericIds = motorIds.map(Number);
    if (numericIds.some(isNaN)) {
      return res.status(400).json({
        message: "ID motor harus berupa angka",
      });
    }

    if (!Array.isArray(weights) || weights.length === 0) {
      return res.status(400).json({
        message: "Data bobot harus dikirim",
      });
    }

    const data = await calculateManualTOPSIS(numericIds, weights);

    return res.status(200).json({
      message: "Perhitungan TOPSIS manual berhasil",
      data,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message || "Gagal menghitung TOPSIS manual",
    });
  }
};

// ======================================
// DELETE REQUEST
// ======================================
export const deleteRecommendation = async (
  req: Request,
  res: Response
) => {
  try {
    const { requestId } = req.params;

    const recommendation = await prisma.recommendationRequest.findUnique({
      where: {
        id: Number(requestId),
      },
    });

    if (!recommendation) {
      return res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }

    await prisma.recommendationResult.deleteMany({
      where: {
        requestId: Number(requestId),
      },
    });

    await prisma.requestWeight.deleteMany({
      where: {
        requestId: Number(requestId),
      },
    });

    await prisma.recommendationRequest.delete({
      where: {
        id: Number(requestId),
      },
    });

    return res.status(200).json({
      message: "Request berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal menghapus request",
    });
  }
};