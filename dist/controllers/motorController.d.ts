import { Request, Response } from "express";
export declare const getMotors: (req: Request, res: Response) => Promise<void>;
export declare const createMotor: (req: Request, res: Response) => Promise<void>;
export declare const showMotor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateMotor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteMotor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=motorController.d.ts.map