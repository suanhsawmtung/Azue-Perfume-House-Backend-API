import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { cleanupUploadedFiles } from "../utils/file-cleanup";

type ApplicationError = Error & {
  status?: unknown;
  code?: unknown;
};

const isApplicationError = (error: unknown): error is ApplicationError => {
  return (
    error instanceof Error &&
    typeof (error as ApplicationError).code === "string"
  );
};

const getStatusCode = (status: unknown): number => {
  return (
    typeof status === "number" &&
    Number.isInteger(status) &&
    status >= 100 &&
    status <= 599
  )
    ? status
    : 500;
};

export const errorHandler: ErrorRequestHandler = async (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Clean up uploaded files if any error occurs
  try {
    await cleanupUploadedFiles(req as any);
  } catch (cleanupError) {
    console.error("Error cleaning up uploaded files:", cleanupError);
  }

  console.log(error);

  const applicationError = isApplicationError(error);
  const status = getStatusCode(applicationError ? error.status : undefined);
  const isProduction = env.appEnv === "production";
  const message =
    applicationError || (!isProduction && error instanceof Error)
      ? error.message || "Server Error"
      : "Server Error";
  const errorCode = applicationError ? error.code : "Error_Code";

  res.status(status).json({ message, error: errorCode });
};
