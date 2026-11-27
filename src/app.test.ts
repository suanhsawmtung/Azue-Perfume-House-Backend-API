import { Request, Response } from "express";
import { createError } from "./utils/common";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/global-error-handler";
import { cleanupUploadedFiles } from "./utils/file-cleanup";

jest.mock("./utils/file-cleanup", () => ({
  cleanupUploadedFiles: jest.fn().mockResolvedValue(undefined),
}));

const cleanupMock = cleanupUploadedFiles as jest.MockedFunction<
  typeof cleanupUploadedFiles
>;

const createResponse = () => {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };

  response.status.mockReturnValue(response as never);

  return response as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

const request = {} as Request;
const next = jest.fn();

describe("global error handler", () => {
  const originalAppEnv = env.appEnv;
  let consoleLog: jest.SpyInstance;
  let consoleError: jest.SpyInstance;

  beforeAll(() => {
    consoleLog = jest.spyOn(console, "log").mockImplementation(() => undefined);
    consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
  });

  beforeEach(() => {
    cleanupMock.mockReset();
    cleanupMock.mockResolvedValue(undefined);
    next.mockReset();
    env.appEnv = originalAppEnv;
  });

  afterAll(() => {
    env.appEnv = originalAppEnv;
    consoleLog.mockRestore();
    consoleError.mockRestore();
  });

  it("preserves the response for a known application error", async () => {
    const response = createResponse();
    const error = createError({
      message: "Invalid password!",
      status: 400,
      code: "Error_InvalidPassword",
    });

    await errorHandler(error, request, response, next);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: "Invalid password!",
      error: "Error_InvalidPassword",
    });
  });

  it("uses a safe 500 response for an unexpected error in production", async () => {
    env.appEnv = "production";
    const response = createResponse();

    await errorHandler(
      new Error("database password leaked"),
      request,
      response,
      next,
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      message: "Server Error",
      error: "Error_Code",
    });
  });

  it.each([undefined, null, "not-an-error", 42])(
    "defensively handles unexpected error value %p",
    async (error) => {
      env.appEnv = "production";
      const response = createResponse();

      await errorHandler(error, request, response, next);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({
        message: "Server Error",
        error: "Error_Code",
      });
    },
  );

  it.each([0, 99, 600, 999, "400", Number.NaN])(
    "falls back to 500 for invalid application status %p",
    async (status) => {
      const response = createResponse();
      const error = createError({
        message: "Known application error",
        status: status as number,
        code: "Error_Invalid",
      });

      await errorHandler(error, request, response, next);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({
        message: "Known application error",
        error: "Error_Invalid",
      });
    },
  );

  it("does not let cleanup failure prevent the original response", async () => {
    cleanupMock.mockRejectedValueOnce(new Error("cleanup failed"));
    const response = createResponse();

    await errorHandler(
      createError({
        message: "Not found",
        status: 404,
        code: "Error_NotFound",
      }),
      request,
      response,
      next,
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      message: "Not found",
      error: "Error_NotFound",
    });
  });
});
