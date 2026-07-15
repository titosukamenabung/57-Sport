import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
import { calculateTOPSIS } from "../services/topsisService.js";

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

    const result = await calculateTOPSIS(Number(requestId));

    return res.status(200).json({
      message: "Perhitungan TOPSIS berhasil",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal menghitung TOPSIS",
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