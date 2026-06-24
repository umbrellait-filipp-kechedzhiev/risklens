import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import Fastify from "fastify";
import { ZodError } from "zod";
import { authRoutes } from "./auth.js";
import { env } from "./env.js";
import { appRoutes } from "./routes.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: env.webOrigin, credentials: true });
await app.register(jwt, { secret: env.jwtSecret });
await app.register(swagger, {
  openapi: {
    info: { title: "RiskLens API", version: "0.1.0" }
  }
});

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.code(400).send({ message: "Ошибка проверки данных", issues: error.flatten() });
  }
  app.log.error(error);
  return reply.code(500).send({ message: "Внутренняя ошибка сервера" });
});

app.get("/health", async () => ({ ok: true }));
await app.register(authRoutes);
await app.register(appRoutes);

await app.listen({ port: env.port, host: "0.0.0.0" });
