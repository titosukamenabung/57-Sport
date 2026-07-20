import { Request, Response } from "express";
export declare const getMerks: (req: Request, res: Response) => Promise<void>;
export declare const createMerk: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const showMerk: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateMerk: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteMerk: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=merkController.d.ts.map