import { prisma } from "../lib/db.js";
// ======================================
// KONVERSI SKALA C1 - C7
// ======================================
// C1 Harga (COST)
const skalaHarga = (harga) => {
    if (harga < 5000000)
        return 5;
    if (harga <= 10000000)
        return 4;
    if (harga <= 15000000)
        return 3;
    if (harga <= 20000000)
        return 2;
    return 1;
};
// C2 CC
const skalaCC = (cc) => {
    if (cc < 110)
        return 1;
    if (cc <= 125)
        return 2;
    if (cc <= 150)
        return 3;
    if (cc <= 160)
        return 4;
    return 5;
};
// C3 Merk
const skalaMerk = (namaMerk) => {
    const merk = namaMerk?.toLowerCase() || "";
    if (merk.includes("honda"))
        return 5;
    if (merk.includes("yamaha"))
        return 4;
    if (merk.includes("suzuki") ||
        merk.includes("kawasaki") ||
        merk.includes("vespa"))
        return 3;
    if (merk.includes("keeway"))
        return 2;
    return 1;
};
// C4 Tahun
const skalaTahun = (tahun) => {
    if (tahun < 2015)
        return 1;
    if (tahun <= 2017)
        return 2;
    if (tahun <= 2020)
        return 3;
    if (tahun <= 2022)
        return 4;
    return 5;
};
// C5 Efisiensi BBM
const skalaBBM = (bbm) => {
    if (bbm < 30)
        return 1;
    if (bbm <= 40)
        return 2;
    if (bbm <= 50)
        return 3;
    if (bbm <= 60)
        return 4;
    return 5;
};
// C6 Masa Pajak
const skalaPajak = (bulan) => {
    if (bulan < 3)
        return 1;
    if (bulan <= 6)
        return 2;
    if (bulan <= 9)
        return 3;
    if (bulan <= 12)
        return 4;
    return 5;
};
// C7 Kondisi Fisik (1-10 menjadi 1-5)
const skalaKondisi = (nilai) => {
    if (nilai <= 2)
        return 1;
    if (nilai <= 4)
        return 2;
    if (nilai <= 6)
        return 3;
    if (nilai <= 8)
        return 4;
    return 5;
};
// ======================================
// Progressive Filter Builder
// ======================================
/** Urutan filter yang akan dilepas ketika hasil kurang dari 3 motor (dari paling tidak penting) */
const REMOVAL_ORDER = [
    'kondisiFisik',
    'masaPajakStnk',
    'efisiensiBbm',
    'tahunMotor',
    'cc',
    'harga',
    'merk',
];
/**
 * Membangun Prisma where clause berdasarkan preferensi user,
 * mengecualikan filter yang ada di excludeFilters.
 * Mengembalikan where clause dan daftar filter yang aktif.
 */
function buildWhere(prefs, excludeFilters) {
    const where = {};
    const activeFilters = [];
    if (!prefs)
        return { where, activeFilters };
    if (!excludeFilters.has('merk') && prefs.merkId) {
        where.merkId = prefs.merkId;
        activeFilters.push('merk');
    }
    if (!excludeFilters.has('harga') && (prefs.hargaMin !== undefined || prefs.hargaMax !== undefined)) {
        where.harga = {};
        if (prefs.hargaMin !== undefined)
            where.harga.gte = prefs.hargaMin;
        if (prefs.hargaMax !== undefined)
            where.harga.lte = prefs.hargaMax;
        activeFilters.push('harga');
    }
    if (!excludeFilters.has('cc') && (prefs.ccMin !== undefined || prefs.ccMax !== undefined)) {
        where.cc = {};
        if (prefs.ccMin !== undefined)
            where.cc.gte = prefs.ccMin;
        if (prefs.ccMax !== undefined)
            where.cc.lte = prefs.ccMax;
        activeFilters.push('cc');
    }
    if (!excludeFilters.has('tahunMotor') && (prefs.tahunMotorMin !== undefined || prefs.tahunMotorMax !== undefined)) {
        where.tahunMotor = {};
        if (prefs.tahunMotorMin !== undefined)
            where.tahunMotor.gte = prefs.tahunMotorMin;
        if (prefs.tahunMotorMax !== undefined)
            where.tahunMotor.lte = prefs.tahunMotorMax;
        activeFilters.push('tahunMotor');
    }
    if (!excludeFilters.has('efisiensiBbm') && (prefs.efisiensiBbmMin !== undefined || prefs.efisiensiBbmMax !== undefined)) {
        where.efisiensiBbm = {};
        if (prefs.efisiensiBbmMin !== undefined)
            where.efisiensiBbm.gte = prefs.efisiensiBbmMin;
        if (prefs.efisiensiBbmMax !== undefined)
            where.efisiensiBbm.lte = prefs.efisiensiBbmMax;
        activeFilters.push('efisiensiBbm');
    }
    if (!excludeFilters.has('masaPajakStnk') && (prefs.masaPajakStnkMin !== undefined || prefs.masaPajakStnkMax !== undefined)) {
        where.masaPajakStnk = {};
        if (prefs.masaPajakStnkMin !== undefined)
            where.masaPajakStnk.gte = prefs.masaPajakStnkMin;
        if (prefs.masaPajakStnkMax !== undefined)
            where.masaPajakStnk.lte = prefs.masaPajakStnkMax;
        activeFilters.push('masaPajakStnk');
    }
    if (!excludeFilters.has('kondisiFisik') && (prefs.kondisiFisikMin !== undefined || prefs.kondisiFisikMax !== undefined)) {
        where.kondisiFisik = {};
        if (prefs.kondisiFisikMin !== undefined)
            where.kondisiFisik.gte = prefs.kondisiFisikMin;
        if (prefs.kondisiFisikMax !== undefined)
            where.kondisiFisik.lte = prefs.kondisiFisikMax;
        activeFilters.push('kondisiFisik');
    }
    return { where, activeFilters };
}
// ======================================
// TOPSIS untuk Recommendation Request
// ======================================
export const calculateTOPSIS = async (requestId, preferences) => {
    try {
        // ======================================
        // Ambil Recommendation Request
        // ======================================
        const request = await prisma.recommendationRequest.findUnique({
            where: { id: requestId },
            include: {
                weights: {
                    include: { kriteria: true },
                },
            },
        });
        if (!request) {
            throw new Error("Recommendation Request tidak ditemukan");
        }
        // ======================================
        // Ambil Semua Kriteria
        // ======================================
        const kriterias = await prisma.kriteria.findMany({
            orderBy: { kode: "asc" },
        });
        if (kriterias.length === 0) {
            throw new Error("Data kriteria kosong");
        }
        // ======================================
        // Mengambil Bobot User
        // ======================================
        const bobotMap = Object.fromEntries(request.weights.map((w) => [
            w.kriteria.kode.toUpperCase(),
            w.bobot,
        ]));
        const bobot = {
            harga: bobotMap.C1 ?? 0,
            cc: bobotMap.C2 ?? 0,
            merk: bobotMap.C3 ?? 0,
            tahunMotor: bobotMap.C4 ?? 0,
            efisiensiBbm: bobotMap.C5 ?? 0,
            masaPajakStnk: bobotMap.C6 ?? 0,
            kondisiFisik: bobotMap.C7 ?? 0,
        };
        // ======================================
        // Progressive Filtering
        // ======================================
        const excluded = new Set();
        const removedFilters = [];
        let motors = [];
        while (true) {
            const { where, activeFilters } = buildWhere(preferences, excluded);
            console.log("Filter aktif", where);
            console.log("Filter yang dilepas", removedFilters);
            motors = await prisma.motor.findMany({
                where,
                include: { merk: true },
            });
            console.log("Jumlah motor", motors.length);
            // Cukup hasil — berhenti
            if (motors.length >= 3)
                break;
            // Cari filter yang masih aktif dan belum dilepas (paling tidak penting dulu)
            const nextRemovable = REMOVAL_ORDER.find((f) => !excluded.has(f) && activeFilters.includes(f));
            if (!nextRemovable) {
                // Semua filter yang mungkin sudah dicoba
                break;
            }
            excluded.add(nextRemovable);
            removedFilters.push(nextRemovable);
        }
        // ======================================
        // Tentukan Ranking
        // ======================================
        // Handle kasus database benar-benar kosong
        if (motors.length === 0) {
            throw new Error("Database motor kosong — tidak ada motor yang dapat direkomendasikan.");
        }
        let ranking;
        if (motors.length === 1) {
            // Hanya satu motor — langsung jadi rekomendasi
            ranking = [
                {
                    id: motors[0].id,
                    namaMotor: motors[0].namaMotor,
                    skor: 1,
                    ranking: 1,
                },
            ];
        }
        else {
            // Dua atau lebih — jalankan TOPSIS
            ranking = computeTOPSISRanking(motors, bobot, kriterias);
        }
        // ======================================
        // Hapus Hasil Lama
        // ======================================
        await prisma.recommendationResult.deleteMany({
            where: { requestId },
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
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};
export const computeTOPSISRanking = (motors, bobot, kriterias) => {
    // ======================================
    // Decision Matrix (menggunakan nilai asli, bukan skala 1-5)
    // ======================================
    const decisionMatrix = motors.map((motor) => ({
        id: motor.id,
        namaMotor: motor.namaMotor,
        values: {
            harga: motor.harga,
            cc: motor.cc,
            merk: motor.merkId,
            tahunMotor: motor.tahunMotor,
            efisiensiBbm: motor.efisiensiBbm,
            masaPajakStnk: motor.masaPajakStnk,
            kondisiFisik: motor.kondisiFisik,
        },
    }));
    console.log("===== DECISION MATRIX (raw values) =====");
    console.table(decisionMatrix);
    // ======================================
    // Pembagi Normalisasi
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
    console.log("===== BOBOT =====");
    console.table(bobot);
    // ======================================
    // Atribut Map
    // ======================================
    const atributMap = Object.fromEntries(kriterias.map((k) => [
        k.kode.toUpperCase(),
        k.atribut.toLowerCase(),
    ]));
    // ======================================
    // Solusi Ideal Positif (A+)
    // ======================================
    const idealPositive = {
        harga: atributMap.C1 === "cost"
            ? Math.min(...weightedMatrix.map((m) => m.values.harga))
            : Math.max(...weightedMatrix.map((m) => m.values.harga)),
        cc: atributMap.C2 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.cc))
            : Math.min(...weightedMatrix.map((m) => m.values.cc)),
        merk: atributMap.C3 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.merk))
            : Math.min(...weightedMatrix.map((m) => m.values.merk)),
        tahunMotor: atributMap.C4 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.tahunMotor))
            : Math.min(...weightedMatrix.map((m) => m.values.tahunMotor)),
        efisiensiBbm: atributMap.C5 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.efisiensiBbm))
            : Math.min(...weightedMatrix.map((m) => m.values.efisiensiBbm)),
        masaPajakStnk: atributMap.C6 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.masaPajakStnk))
            : Math.min(...weightedMatrix.map((m) => m.values.masaPajakStnk)),
        kondisiFisik: atributMap.C7 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.kondisiFisik))
            : Math.min(...weightedMatrix.map((m) => m.values.kondisiFisik)),
    };
    console.log("===== IDEAL POSITIVE =====");
    console.table(idealPositive);
    // ======================================
    // Solusi Ideal Negatif (A-)
    // ======================================
    const idealNegative = {
        harga: atributMap.C1 === "cost"
            ? Math.max(...weightedMatrix.map((m) => m.values.harga))
            : Math.min(...weightedMatrix.map((m) => m.values.harga)),
        cc: atributMap.C2 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.cc))
            : Math.max(...weightedMatrix.map((m) => m.values.cc)),
        merk: atributMap.C3 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.merk))
            : Math.max(...weightedMatrix.map((m) => m.values.merk)),
        tahunMotor: atributMap.C4 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.tahunMotor))
            : Math.max(...weightedMatrix.map((m) => m.values.tahunMotor)),
        efisiensiBbm: atributMap.C5 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.efisiensiBbm))
            : Math.max(...weightedMatrix.map((m) => m.values.efisiensiBbm)),
        masaPajakStnk: atributMap.C6 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.masaPajakStnk))
            : Math.max(...weightedMatrix.map((m) => m.values.masaPajakStnk)),
        kondisiFisik: atributMap.C7 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.kondisiFisik))
            : Math.max(...weightedMatrix.map((m) => m.values.kondisiFisik)),
    };
    console.log("===== IDEAL NEGATIVE =====");
    console.table(idealNegative);
    // ======================================
    // Menghitung Jarak (7 Kriteria)
    // ======================================
    const distances = weightedMatrix.map((motor) => {
        const dPlus = Math.sqrt(Math.pow(motor.values.harga - idealPositive.harga, 2) +
            Math.pow(motor.values.cc - idealPositive.cc, 2) +
            Math.pow(motor.values.merk - idealPositive.merk, 2) +
            Math.pow(motor.values.tahunMotor - idealPositive.tahunMotor, 2) +
            Math.pow(motor.values.efisiensiBbm - idealPositive.efisiensiBbm, 2) +
            Math.pow(motor.values.masaPajakStnk - idealPositive.masaPajakStnk, 2) +
            Math.pow(motor.values.kondisiFisik - idealPositive.kondisiFisik, 2));
        const dMinus = Math.sqrt(Math.pow(motor.values.harga - idealNegative.harga, 2) +
            Math.pow(motor.values.cc - idealNegative.cc, 2) +
            Math.pow(motor.values.merk - idealNegative.merk, 2) +
            Math.pow(motor.values.tahunMotor - idealNegative.tahunMotor, 2) +
            Math.pow(motor.values.efisiensiBbm - idealNegative.efisiensiBbm, 2) +
            Math.pow(motor.values.masaPajakStnk - idealNegative.masaPajakStnk, 2) +
            Math.pow(motor.values.kondisiFisik - idealNegative.kondisiFisik, 2));
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
        const skor = motor.dPlus + motor.dMinus === 0
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
    const ranking = preferences
        .sort((a, b) => b.skor - a.skor)
        .map((motor, index) => ({
        ...motor,
        ranking: index + 1,
    }));
    console.log("===== RANKING =====");
    console.table(ranking);
    return ranking;
};
// ======================================
// Manual TOPSIS — full computation with intermediate data
// ======================================
export const calculateManualTOPSIS = async (motorIds, weights) => {
    const motors = await prisma.motor.findMany({
        where: {
            id: { in: motorIds },
        },
        include: {
            merk: true,
        },
    });
    if (motors.length !== motorIds.length) {
        const foundIds = motors.map((m) => m.id);
        const missing = motorIds.filter((id) => !foundIds.includes(id));
        throw new Error(`Motor dengan ID ${missing.join(", ")} tidak ditemukan`);
    }
    const kriterias = await prisma.kriteria.findMany({
        orderBy: { kode: "asc" },
    });
    if (kriterias.length === 0) {
        throw new Error("Data kriteria kosong");
    }
    // Map frontend weights by kriteriaId -> kode
    const weightMap = Object.fromEntries(weights.map((w) => [w.kriteriaId, w.bobot]));
    const bobot = {
        harga: weightMap[kriterias.find((k) => k.kode === "C1")?.id ?? -1] ?? 0,
        cc: weightMap[kriterias.find((k) => k.kode === "C2")?.id ?? -1] ?? 0,
        merk: weightMap[kriterias.find((k) => k.kode === "C3")?.id ?? -1] ?? 0,
        tahunMotor: weightMap[kriterias.find((k) => k.kode === "C4")?.id ?? -1] ?? 0,
        efisiensiBbm: weightMap[kriterias.find((k) => k.kode === "C5")?.id ?? -1] ?? 0,
        masaPajakStnk: weightMap[kriterias.find((k) => k.kode === "C6")?.id ?? -1] ?? 0,
        kondisiFisik: weightMap[kriterias.find((k) => k.kode === "C7")?.id ?? -1] ?? 0,
    };
    const allData = computeTOPSISFullData(motors, bobot, kriterias);
    const motorMap = new Map(motors.map((m) => [m.id, m]));
    const results = allData.ranking.map((r) => ({
        id: r.id,
        ranking: r.ranking,
        skor: r.skor,
        motor: motorMap.get(r.id),
    }));
    return {
        decisionMatrix: allData.decisionMatrix,
        normalizationDivider: allData.pembagi,
        normalizedMatrix: allData.normalizedMatrix,
        weightedMatrix: allData.weightedMatrix,
        idealPositive: allData.idealPositive,
        idealNegative: allData.idealNegative,
        distances: allData.distances,
        preferences: allData.preferences,
        results,
    };
};
function computeTOPSISFullData(motors, bobot, kriterias) {
    // ======================================
    // Decision Matrix (menggunakan nilai asli, bukan skala 1-5)
    // ======================================
    const decisionMatrix = motors.map((motor) => ({
        id: motor.id,
        namaMotor: motor.namaMotor,
        values: {
            harga: motor.harga,
            cc: motor.cc,
            merk: motor.merkId,
            tahunMotor: motor.tahunMotor,
            efisiensiBbm: motor.efisiensiBbm,
            masaPajakStnk: motor.masaPajakStnk,
            kondisiFisik: motor.kondisiFisik,
        },
    }));
    console.log("===== DECISION MATRIX (raw values) =====");
    console.table(decisionMatrix);
    // ======================================
    // Pembagi Normalisasi
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
    console.log("===== BOBOT =====");
    console.table(bobot);
    // ======================================
    // Atribut Map
    // ======================================
    const atributMap = Object.fromEntries(kriterias.map((k) => [
        k.kode.toUpperCase(),
        k.atribut.toLowerCase(),
    ]));
    // ======================================
    // Solusi Ideal Positif (A+)
    // ======================================
    const idealPositive = {
        harga: atributMap.C1 === "cost"
            ? Math.min(...weightedMatrix.map((m) => m.values.harga))
            : Math.max(...weightedMatrix.map((m) => m.values.harga)),
        cc: atributMap.C2 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.cc))
            : Math.min(...weightedMatrix.map((m) => m.values.cc)),
        merk: atributMap.C3 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.merk))
            : Math.min(...weightedMatrix.map((m) => m.values.merk)),
        tahunMotor: atributMap.C4 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.tahunMotor))
            : Math.min(...weightedMatrix.map((m) => m.values.tahunMotor)),
        efisiensiBbm: atributMap.C5 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.efisiensiBbm))
            : Math.min(...weightedMatrix.map((m) => m.values.efisiensiBbm)),
        masaPajakStnk: atributMap.C6 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.masaPajakStnk))
            : Math.min(...weightedMatrix.map((m) => m.values.masaPajakStnk)),
        kondisiFisik: atributMap.C7 === "benefit"
            ? Math.max(...weightedMatrix.map((m) => m.values.kondisiFisik))
            : Math.min(...weightedMatrix.map((m) => m.values.kondisiFisik)),
    };
    console.log("===== IDEAL POSITIVE =====");
    console.table(idealPositive);
    // ======================================
    // Solusi Ideal Negatif (A-)
    // ======================================
    const idealNegative = {
        harga: atributMap.C1 === "cost"
            ? Math.max(...weightedMatrix.map((m) => m.values.harga))
            : Math.min(...weightedMatrix.map((m) => m.values.harga)),
        cc: atributMap.C2 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.cc))
            : Math.max(...weightedMatrix.map((m) => m.values.cc)),
        merk: atributMap.C3 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.merk))
            : Math.max(...weightedMatrix.map((m) => m.values.merk)),
        tahunMotor: atributMap.C4 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.tahunMotor))
            : Math.max(...weightedMatrix.map((m) => m.values.tahunMotor)),
        efisiensiBbm: atributMap.C5 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.efisiensiBbm))
            : Math.max(...weightedMatrix.map((m) => m.values.efisiensiBbm)),
        masaPajakStnk: atributMap.C6 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.masaPajakStnk))
            : Math.max(...weightedMatrix.map((m) => m.values.masaPajakStnk)),
        kondisiFisik: atributMap.C7 === "benefit"
            ? Math.min(...weightedMatrix.map((m) => m.values.kondisiFisik))
            : Math.max(...weightedMatrix.map((m) => m.values.kondisiFisik)),
    };
    console.log("===== IDEAL NEGATIVE =====");
    console.table(idealNegative);
    // ======================================
    // Menghitung Jarak (7 Kriteria)
    // ======================================
    const distances = weightedMatrix.map((motor) => {
        const dPlus = Math.sqrt(Math.pow(motor.values.harga - idealPositive.harga, 2) +
            Math.pow(motor.values.cc - idealPositive.cc, 2) +
            Math.pow(motor.values.merk - idealPositive.merk, 2) +
            Math.pow(motor.values.tahunMotor - idealPositive.tahunMotor, 2) +
            Math.pow(motor.values.efisiensiBbm - idealPositive.efisiensiBbm, 2) +
            Math.pow(motor.values.masaPajakStnk - idealPositive.masaPajakStnk, 2) +
            Math.pow(motor.values.kondisiFisik - idealPositive.kondisiFisik, 2));
        const dMinus = Math.sqrt(Math.pow(motor.values.harga - idealNegative.harga, 2) +
            Math.pow(motor.values.cc - idealNegative.cc, 2) +
            Math.pow(motor.values.merk - idealNegative.merk, 2) +
            Math.pow(motor.values.tahunMotor - idealNegative.tahunMotor, 2) +
            Math.pow(motor.values.efisiensiBbm - idealNegative.efisiensiBbm, 2) +
            Math.pow(motor.values.masaPajakStnk - idealNegative.masaPajakStnk, 2) +
            Math.pow(motor.values.kondisiFisik - idealNegative.kondisiFisik, 2));
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
        const skor = motor.dPlus + motor.dMinus === 0
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
    const ranking = preferences
        .sort((a, b) => b.skor - a.skor)
        .map((motor, index) => ({
        ...motor,
        ranking: index + 1,
    }));
    console.log("===== RANKING =====");
    console.table(ranking);
    return {
        decisionMatrix,
        pembagi,
        normalizedMatrix,
        weightedMatrix,
        idealPositive,
        idealNegative,
        distances,
        preferences,
        ranking,
    };
}
//# sourceMappingURL=topsisService.js.map