import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { errorCode } from "../config/error-code";
import { AuthService } from "../services/auth/auth.service";
import { CustomRequest } from "../types/common";
import { createError } from "../utils/common";

const authService = new AuthService();

const isAppleDevice = (req: CustomRequest) =>
  String(req.headers["is-apple-device"]).toLowerCase() === "true";

const getBearerToken = (req: CustomRequest) => {
  const authorization = req.headers.authorization;
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
};

const getRequestDebugInfo = (req: CustomRequest) => ({
  method: req.method,
  url: req.originalUrl || req.url,
  ip: req.ip,
  userAgent: req.get("user-agent"),
  userId: req.userId,
});

const refreshTokenAndNext = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
  refreshToken: string,
) => {
  try {
    console.log("[auth][refresh] attempting token refresh", {
      ...getRequestDebugInfo(req),
      refreshTokenFingerprint: refreshToken.slice(-8),
    });
    const { data } = await authService.refreshTokens({ refreshToken });

    if (isAppleDevice(req)) {
      res.setHeader("x-access-token", data.accessToken);
      res.setHeader("x-refresh-token", data.refreshToken);
    }

    if (!isAppleDevice(req)) res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: env.appEnv === "production" || env.appEnv === "staging",
      sameSite:
        env.appEnv === "production" || env.appEnv === "staging"
          ? "none"
          : "strict",
      maxAge: 1000 * 60 * 15,
    });

    if (!isAppleDevice(req)) res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: env.appEnv === "production" || env.appEnv === "staging",
      sameSite:
        env.appEnv === "production" || env.appEnv === "staging"
          ? "none"
          : "strict",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    req.userId = +data.userData.id;
    console.log("[auth][refresh] succeeded", {
      ...getRequestDebugInfo(req),
      userId: req.userId,
    });
    return next();
  } catch (error) {
    console.warn("[auth][refresh] failed", {
      ...getRequestDebugInfo(req),
      errorName: (error as any)?.name,
      errorMessage: (error as any)?.message,
      errorCode: (error as any)?.code,
      status: (error as any)?.status,
    });
    return next(error);
  }
};

export const isAuthenticated = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // const platform = req.headers["x-platform"];
    // if (platform === "mobile") {
    //   const accessTokenMobile = req.headers.authorization?.split(" ")[1];
    //   console.log(accessTokenMobile);
    // }

    const appleDevice = isAppleDevice(req);
    const accessToken = appleDevice
      ? getBearerToken(req)
      : req.cookies?.accessToken;
    const refreshToken = appleDevice
      ? ((req.headers["refresh-token"] || req.headers.refreshtoken) as
          | string
          | undefined)
      : req.cookies?.refreshToken;

    console.log("[auth][middleware] request checked", {
      ...getRequestDebugInfo(req),
      hasAccessToken: Boolean(accessToken),
      hasRefreshToken: Boolean(refreshToken),
      isAppleDevice: appleDevice,
    });

    if (!refreshToken) {
      console.warn("[auth][middleware] rejected: refresh token is missing", {
        ...getRequestDebugInfo(req),
        hasAccessToken: Boolean(accessToken),
      });
      const error = createError({
        message: "You are not an authenticated user.",
        status: 401,
        code: errorCode.unauthenticated,
      });

      return next(error);
    }

    if (!accessToken) {
      console.log(
        "[auth][middleware] access token is missing; using refresh token",
        {
          ...getRequestDebugInfo(req),
        },
      );
      return await refreshTokenAndNext(req, res, next, refreshToken);
    } else {
      try {
        const decoded = jwt.verify(accessToken, env.jwt.accessTokenSecret) as {
          id: number;
        };

        if (!decoded.id || isNaN(decoded.id)) {
          const error = createError({
            message: "This user does not exist.",
            status: 404,
            code: errorCode.authNotFound,
          });

          return next(error);
        }

        req.userId = +decoded.id;

        console.log("[auth][middleware] access token accepted", {
          ...getRequestDebugInfo(req),
          userId: req.userId,
        });

        return next();
      } catch (err: any) {
        if (err.name === "TokenExpiredError") {
          console.log(
            "[auth][middleware] access token expired; using refresh token",
            {
              ...getRequestDebugInfo(req),
              tokenError: err.name,
            },
          );
          return await refreshTokenAndNext(req, res, next, refreshToken);
        } else {
          console.warn("[auth][middleware] rejected: access token is invalid", {
            ...getRequestDebugInfo(req),
            tokenError: err?.name,
            tokenMessage: err?.message,
          });
          const error = createError({
            message: "Access Token is invalid.",
            status: 400,
            code: errorCode.attack,
          });

          return next(error);
        }
      }
    }
  } catch (error) {
    return next(error);
  }
};

export const tryAuthenticate = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  isAuthenticated(req, res, () => next());
};
