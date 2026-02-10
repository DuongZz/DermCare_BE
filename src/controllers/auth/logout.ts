// import { Request, Response, NextFunction } from "express";
// import { CustomError } from "utils/response/custom-error/CustomError";

// export const logout = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         if(req.user){

//         }
//         res.customSuccess(200, 'Logout successfully.', null);
//     } catch (err) {
//         const customError = new CustomError(400, 'Raw', "Logout failed", null, err);
//         return next(customError);
//     }
// };
