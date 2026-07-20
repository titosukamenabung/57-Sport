import { Request, Response } from "express";
export declare const getRecommendations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMyHistory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createRecommendationRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const showRecommendation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const calculateRecommendation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const calculateManualRecommendation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteRecommendation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=recommendationController.d.ts.map