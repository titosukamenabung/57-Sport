export interface MotorPreferences {
    merkId?: number;
    hargaMin?: number;
    hargaMax?: number;
    ccMin?: number;
    ccMax?: number;
    tahunMotorMin?: number;
    tahunMotorMax?: number;
    efisiensiBbmMin?: number;
    efisiensiBbmMax?: number;
    masaPajakStnkMin?: number;
    masaPajakStnkMax?: number;
    kondisiFisikMin?: number;
    kondisiFisikMax?: number;
}
export declare const calculateTOPSIS: (requestId: number, preferences?: MotorPreferences) => Promise<{
    id: number;
    namaMotor: string;
    skor: number;
    ranking: number;
}[]>;
interface MotorWithMerk {
    id: number;
    namaMotor: string;
    harga: number;
    cc: number;
    merkId: number;
    merk?: {
        namaMerk: string;
    } | null;
    tahunMotor: number;
    efisiensiBbm: number;
    masaPajakStnk: number;
    kondisiFisik: number;
}
interface BobotInput {
    harga: number;
    cc: number;
    merk: number;
    tahunMotor: number;
    efisiensiBbm: number;
    masaPajakStnk: number;
    kondisiFisik: number;
}
export declare const computeTOPSISRanking: (motors: MotorWithMerk[], bobot: BobotInput, kriterias: {
    kode: string;
    atribut: string;
}[]) => {
    ranking: number;
    id: number;
    namaMotor: string;
    skor: number;
}[];
export declare const calculateManualTOPSIS: (motorIds: number[], weights: {
    kriteriaId: number;
    bobot: number;
}[]) => Promise<{
    decisionMatrix: any[];
    normalizationDivider: any;
    normalizedMatrix: any[];
    weightedMatrix: any[];
    idealPositive: any;
    idealNegative: any;
    distances: any[];
    preferences: any[];
    results: {
        id: any;
        ranking: any;
        skor: any;
        motor: {
            merk: {
                id: number;
                namaMerk: string;
            };
        } & {
            createdAt: Date;
            id: number;
            namaMotor: string;
            tipe: string;
            warna: string;
            transmisi: string;
            deskripsi: string;
            foto: string;
            status: string;
            harga: number;
            cc: number;
            tahunMotor: number;
            efisiensiBbm: number;
            masaPajakStnk: number;
            kondisiFisik: number;
            userId: number;
            merkId: number;
        };
    }[];
}>;
export {};
//# sourceMappingURL=topsisService.d.ts.map