import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";

import path from "path";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import passport from "./config/passport";
import { swaggerSpec } from "./docs/swagger";
import { startCronJobs } from "./jobs";
import { isMaintenanceMode } from "./middlewares/ensure-not-in-maintenance";
import { errorHandler } from "./middlewares/global-error-handler";
import routes from "./routes";

const whitelist = env.corsOrigins;
const corsOptions = {
  origin: function (
    origin: any,
    callback: (error: Error | null, origin?: boolean) => void,
  ) {
    if (!origin) return callback(null, true);
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: ["x-access-token", "x-refresh-token"],
};

export const app: Express = express();

app.set("trust proxy", 1);

app
  .use(morgan("dev"))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cookieParser())
  .use(cors(corsOptions))
  .use(helmet())
  .use(compression())
  .use(passport.initialize());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(
  "/post",
  express.static("uploads/images/post", {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

app.use("/post", express.static(path.resolve("uploads/images/post")));

app.use(
  "/product",
  express.static("uploads/images/product", {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

app.use("/product", express.static(path.resolve("uploads/images/product")));

app.use(
  "/order",
  express.static("uploads/images/order", {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

app.use("/order", express.static(path.resolve("uploads/images/order")));

app.use(
  "/user",
  express.static("uploads/images/user", {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

app.use("/user", express.static(path.resolve("uploads/images/user")));

app.use(isMaintenanceMode).use(routes);

app.use(errorHandler);

startCronJobs();
