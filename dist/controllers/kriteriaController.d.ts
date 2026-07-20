import { Request, Response } from "express";
export declare const getKriterias: (req: Request, res: Response) => Promise<void>;
export declare const createKriteria: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const showKriteria: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateKriteria: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteKriteria: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=kriteriaController.d.ts.map