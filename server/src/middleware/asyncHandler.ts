import type { NextFunction, Request, Response } from 'express';

type AsyncController<TRequest extends Request = Request> = (
  req: TRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler =
  <TRequest extends Request = Request>(fn: AsyncController<TRequest>) =>
  (req: TRequest, res: Response, next: NextFunction) => {
    void fn(req, res, next).catch(next);
  };
