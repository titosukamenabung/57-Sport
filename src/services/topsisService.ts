import { prisma } from "../lib/db.js";

// ======================================
// KONVERSI SKALA C1 - C7
// ======================================

// C1 Harga (COST)
const skalaHarga = (harga: number): number => {
  if (harga < 5000000) return 5;
  if (harga <= 10000000) return 4;
  if (harga <= 15000000) return 3;
  if (harga <= 20000000) return 2;
  return 1;
};

// C2 CC
const skalaCC = (cc: number): number => {
  if (cc < 110) return 1;
  if (cc <= 125) return 2;
  if (cc <= 150) return 3;
  if (cc <= 160) return 4;
  return 5;
};

// C3 Merk
const skalaMerk = (namaMerk?: string): number => {
  const merk = namaMerk?.toLowerCase() || "";

  if (merk.includes("honda")) return 5;

  if (merk.includes("yamaha")) return 4;

  if (
    merk.includes("suzuki") ||
    merk.includes("kawasaki") ||
    merk.includes("vespa")
  )
    return 3;

  if (merk.includes("keeway")) return 2;

  return 1;
};

// C4 Tahun
const skalaTahun = (tahun: number): number => {
  if (tahun < 2015) return 1;
  if (tahun <= 2017) return 2;
  if (tahun <= 2020) return 3;
  if (tahun <= 2022) return 4;
  return 5;
};

// C5 Efisiensi BBM
const skalaBBM = (bbm: number): number => {
  if (bbm < 30) return 1;
  if (bbm <= 40) return 2;
  if (bbm <= 50) return 3;
  if (bbm <= 60) return 4;
  return 5;
};

// C6 Masa Pajak
const skalaPajak = (bulan: number): number => {
  if (bulan < 3) return 1;
  if (bulan <= 6) return 2;
  if (bulan <= 9) return 3;
  if (bulan <= 12) return 4;
  return 5;
};

// C7 Kondisi Fisik (1-10 menjadi 1-5)
const skalaKondisi = (nilai: number): number => {
  if (nilai <= 2) return 1;
  if (nilai <= 4) return 2;
  if (nilai <= 6) return 3;
  if (nilai <= 8) return 4;
  return 5;
};

export const calculateTOPSIS = async (requestId: number) => {
  try {
    // ======================================
    // Ambil Recommendation Request
    // ======================================

    const request = await prisma.recommendationRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        weights: {
          include: {
            kriteria: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error("Recommendation Request tidak ditemukan");
    }

    // ======================================
    // Ambil Semua Motor beserta MERK
    // ======================================

    const motors = await prisma.motor.findMany({
      include: {
        merk: true, // Wajib di-include untuk kriteria Merk (C3)
      },
    });

    if (motors.length === 0) {
      throw new Error("Data motor kosong");
    }

    // ======================================
    // Ambil Semua Kriteria
    // ======================================

    const kriterias = await prisma.kriteria.findMany({
      orderBy: {
        kode: "asc", // Urutkan berdasarkan C1, C2, C3...
      },
    });

    if (kriterias.length === 0) {
      throw new Error("Data kriteria kosong");
    }

    // ======================================
    // Fungsi Pembantu Konversi Nilai Merk (C3)
    // ======================================
    const decisionMatrix = motors.map((motor) => ({
      id: motor.id,
      namaMotor: motor.namaMotor,

      values: {
        harga: skalaHarga(motor.harga),
        cc: skalaCC(motor.cc),
        merk: skalaMerk(motor.merk?.namaMerk),
        tahunMotor: skalaTahun(motor.tahunMotor),
        efisiensiBbm: skalaBBM(motor.efisiensiBbm),
        masaPajakStnk: skalaPajak(motor.masaPajakStnk),
        kondisiFisik: skalaKondisi(motor.kondisiFisik),
      },
    }));

    // ======================================
    // Decision Matrix (Diperbarui jadi 7 Kriteria)
    // ======================================

    
    

    console.log("===== DECISION MATRIX =====");
    console.table(decisionMatrix);

    // ======================================
    // Pembagi Normalisasi (7 Kriteria)
    // ======================================

    const pembagi = {
      harga: Math.sqrt(decisionMatrix.reduce((sum, m) => sum + Math.pow(m.values.harga, 2), 0)),
      cc: Math.sqrt(decisionMatrix.reduce((sum, m) => sum + Math.pow(m.values.cc, 2), 0)),
      merk: Math.sqrt(decisionMatrix.reduce((sum, m) => sum + Math.pow(m.values.merk, 2), 0)),
      tahunMotor: Math.sqrt(decisionMatrix.reduce((sum, m) => sum + Math.pow(m.values.tahunMotor, 2), 0)),
      efisiensiBbm: Math.sqrt(decisionMatrix.reduce((sum, m) => sum + Math.pow(m.values.efisiensiBbm, 2), 0)),
      masaPajakStnk: Math.sqrt(decisionMatrix.reduce((sum, m) => sum + Math.pow(m.values.masaPajakStnk, 2), 0)),
      kondisiFisik: Math.sqrt(decisionMatrix.reduce((sum, m) => sum + Math.pow(m.values.kondisiFisik, 2), 0)),
    };

    console.log("===== PEMBAGI =====");
    console.table(pembagi);

    // ======================================
    // Matriks Normalisasi (R)
    // ======================================

    const normalizedMatrix = decisionMatrix.map((motor) => ({
      id: motor.id,
      namaMotor: motor.namaMotor,

      values: {
        harga: pembagi.harga !== 0 ? motor.values.harga / pembagi.harga : 0,
        cc: pembagi.cc !== 0 ? motor.values.cc / pembagi.cc : 0,
        merk: pembagi.merk !== 0 ? motor.values.merk / pembagi.merk : 0,
        tahunMotor: pembagi.tahunMotor !== 0 ? motor.values.tahunMotor / pembagi.tahunMotor : 0,
        efisiensiBbm: pembagi.efisiensiBbm !== 0 ? motor.values.efisiensiBbm / pembagi.efisiensiBbm : 0,
        masaPajakStnk: pembagi.masaPajakStnk !== 0 ? motor.values.masaPajakStnk / pembagi.masaPajakStnk : 0,
        kondisiFisik: pembagi.kondisiFisik !== 0 ? motor.values.kondisiFisik / pembagi.kondisiFisik : 0,
      },
    }));

    console.log("===== NORMALIZED MATRIX =====");
    console.table(normalizedMatrix);

    // ======================================
    // Mengambil Bobot dari Request (C1 - C7)
    // ======================================

    // ======================================
// Mengambil Bobot User
// ======================================

    const bobotMap = Object.fromEntries(
      request.weights.map((w) => [
        w.kriteria.kode.toUpperCase(),
        w.bobot,
      ])
    );

    const bobot = {
      harga: bobotMap.C1 ?? 0,
      cc: bobotMap.C2 ?? 0,
      merk: bobotMap.C3 ?? 0,
      tahunMotor: bobotMap.C4 ?? 0,
      efisiensiBbm: bobotMap.C5 ?? 0,
      masaPajakStnk: bobotMap.C6 ?? 0,
      kondisiFisik: bobotMap.C7 ?? 0,
    };

    console.log("===== BOBOT =====");
    console.table(bobot);

    // ======================================
    // Matriks Normalisasi Berbobot (Y)
    // ======================================

    const weightedMatrix = normalizedMatrix.map((motor) => ({
        id: motor.id,
        namaMotor: motor.namaMotor,

        values: {
          harga: motor.values.harga * bobot.harga,
          cc: motor.values.cc * bobot.cc,
          merk: motor.values.merk * bobot.merk,
          tahunMotor: motor.values.tahunMotor * bobot.tahunMotor,
          efisiensiBbm: motor.values.efisiensiBbm * bobot.efisiensiBbm,
          masaPajakStnk: motor.values.masaPajakStnk * bobot.masaPajakStnk,
          kondisiFisik: motor.values.kondisiFisik * bobot.kondisiFisik,
        },
      }));

      console.log("===== WEIGHTED MATRIX =====");
      console.table(weightedMatrix);

    console.log("===== WEIGHTED MATRIX =====");
    console.table(weightedMatrix);

    const atributMap = Object.fromEntries(
      kriterias.map((k) => [
        k.kode.toUpperCase(),
        k.atribut.toLowerCase(),
      ])
    );

    // ======================================
    // Solusi Ideal Positif (A+)
    // ======================================

    const idealPositive = {
  harga:
    atributMap.C1 === "cost"
      ? Math.min(...weightedMatrix.map((m) => m.values.harga))
      : Math.max(...weightedMatrix.map((m) => m.values.harga)),

  cc:
    atributMap.C2 === "benefit"
      ? Math.max(...weightedMatrix.map((m) => m.values.cc))
      : Math.min(...weightedMatrix.map((m) => m.values.cc)),

  merk:
    atributMap.C3 === "benefit"
      ? Math.max(...weightedMatrix.map((m) => m.values.merk))
      : Math.min(...weightedMatrix.map((m) => m.values.merk)),

  tahunMotor:
    atributMap.C4 === "benefit"
      ? Math.max(...weightedMatrix.map((m) => m.values.tahunMotor))
      : Math.min(...weightedMatrix.map((m) => m.values.tahunMotor)),

  efisiensiBbm:
    atributMap.C5 === "benefit"
      ? Math.max(...weightedMatrix.map((m) => m.values.efisiensiBbm))
      : Math.min(...weightedMatrix.map((m) => m.values.efisiensiBbm)),

  masaPajakStnk:
    atributMap.C6 === "benefit"
      ? Math.max(...weightedMatrix.map((m) => m.values.masaPajakStnk))
      : Math.min(...weightedMatrix.map((m) => m.values.masaPajakStnk)),

  kondisiFisik:
    atributMap.C7 === "benefit"
      ? Math.max(...weightedMatrix.map((m) => m.values.kondisiFisik))
      : Math.min(...weightedMatrix.map((m) => m.values.kondisiFisik)),
};

console.log("===== IDEAL POSITIVE =====");
console.table(idealPositive);

    // ======================================
    // Solusi Ideal Negatif (A-)
    // ======================================

    const idealNegative = {
  harga:
    atributMap.C1 === "cost"
      ? Math.max(...weightedMatrix.map((m) => m.values.harga))
      : Math.min(...weightedMatrix.map((m) => m.values.harga)),

  cc:
    atributMap.C2 === "benefit"
      ? Math.min(...weightedMatrix.map((m) => m.values.cc))
      : Math.max(...weightedMatrix.map((m) => m.values.cc)),

  merk:
    atributMap.C3 === "benefit"
      ? Math.min(...weightedMatrix.map((m) => m.values.merk))
      : Math.max(...weightedMatrix.map((m) => m.values.merk)),

  tahunMotor:
    atributMap.C4 === "benefit"
      ? Math.min(...weightedMatrix.map((m) => m.values.tahunMotor))
      : Math.max(...weightedMatrix.map((m) => m.values.tahunMotor)),

  efisiensiBbm:
    atributMap.C5 === "benefit"
      ? Math.min(...weightedMatrix.map((m) => m.values.efisiensiBbm))
      : Math.max(...weightedMatrix.map((m) => m.values.efisiensiBbm)),

  masaPajakStnk:
    atributMap.C6 === "benefit"
      ? Math.min(...weightedMatrix.map((m) => m.values.masaPajakStnk))
      : Math.max(...weightedMatrix.map((m) => m.values.masaPajakStnk)),

  kondisiFisik:
    atributMap.C7 === "benefit"
      ? Math.min(...weightedMatrix.map((m) => m.values.kondisiFisik))
      : Math.max(...weightedMatrix.map((m) => m.values.kondisiFisik)),
};

console.log("===== IDEAL NEGATIVE =====");
console.table(idealNegative);

    console.log("===== IDEAL POSITIVE =====");
    console.table(idealPositive);

    console.log("===== IDEAL NEGATIVE =====");
    console.table(idealNegative);

    // ======================================
    // Menghitung Jarak (7 Kriteria)
    // ======================================

    const distances = weightedMatrix.map((motor) => {

  const dPlus = Math.sqrt(
    Math.pow(motor.values.harga - idealPositive.harga, 2) +
    Math.pow(motor.values.cc - idealPositive.cc, 2) +
    Math.pow(motor.values.merk - idealPositive.merk, 2) +
    Math.pow(motor.values.tahunMotor - idealPositive.tahunMotor, 2) +
    Math.pow(motor.values.efisiensiBbm - idealPositive.efisiensiBbm, 2) +
    Math.pow(motor.values.masaPajakStnk - idealPositive.masaPajakStnk, 2) +
    Math.pow(motor.values.kondisiFisik - idealPositive.kondisiFisik, 2)
  );

  const dMinus = Math.sqrt(
    Math.pow(motor.values.harga - idealNegative.harga, 2) +
    Math.pow(motor.values.cc - idealNegative.cc, 2) +
    Math.pow(motor.values.merk - idealNegative.merk, 2) +
    Math.pow(motor.values.tahunMotor - idealNegative.tahunMotor, 2) +
    Math.pow(motor.values.efisiensiBbm - idealNegative.efisiensiBbm, 2) +
    Math.pow(motor.values.masaPajakStnk - idealNegative.masaPajakStnk, 2) +
    Math.pow(motor.values.kondisiFisik - idealNegative.kondisiFisik, 2)
  );

  return {
    id: motor.id,
    namaMotor: motor.namaMotor,
    dPlus,
    dMinus,
  };
});

console.log("===== DISTANCE =====");
console.table(distances);
    // ======================================
    // Menghitung Nilai Preferensi
    // ======================================

    const preferences = distances.map((motor) => {

  const skor =
    motor.dPlus + motor.dMinus === 0
      ? 0
      : motor.dMinus / (motor.dPlus + motor.dMinus);

  return {
    id: motor.id,
    namaMotor: motor.namaMotor,
    skor: Number(skor.toFixed(4)),
  };

});

console.log("===== PREFERENCE =====");
console.table(preferences);

    // ======================================
    // Ranking
    // ======================================

    preferences.sort((a, b) => b.skor - a.skor);

    const ranking = preferences
  .sort((a, b) => b.skor - a.skor)
  .map((motor, index) => ({
    ...motor,
    ranking: index + 1,
  }));

console.log("===== RANKING =====");
console.table(ranking);

    // ======================================
    // Hapus Hasil Lama
    // ======================================

    await prisma.recommendationResult.deleteMany({
      where: {
        requestId,
      },
    });

    // ======================================
    // Simpan Hasil Baru
    // ======================================

    await prisma.recommendationResult.createMany({
      data: ranking.map((motor) => ({
        requestId,
        motorId: motor.id,
        skor: motor.skor,
        ranking: motor.ranking,
      })),
    });

    return ranking;

  } catch (error) {
    console.error(error);
    throw error;
  }
};