import express, { json } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";

dotenv.config();

import { notFound, errorHandler } from "./middlewares.js";
import api from "./routes/index.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.BLOCK_WITH_CORS === "true"
        ? !process.env.ALLOWLIST ||
          process.env.ALLOWLIST === "" ||
          process.env.ALLOWLIST === "*"
          ? "*"
          : process.env.ALLOWLIST.split(",")
        : "*", 
  })
);
app.use(json());

Sentry.init({
  environment: process.env.NODE_ENV,
  dsn: process.env.SENTRY_DSN_URL,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
  ],
  tracesSampleRate: 0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.get("/", (req, res) => {
  res.json({
    code: 200,
    message: "Success, Welcome to ANIME @ ADGSTUDIOS API",
    repo: "https://github.com/ADGSTUDIOS/animeapiv2",
  });
});

app.use("/api", api);

app.use(Sentry.Handlers.errorHandler());

app.use(notFound);
app.use(errorHandler);

export default app;
