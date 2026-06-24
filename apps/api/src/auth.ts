import bcrypt from "bcryptjs";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "./prisma.js";
import { loginSchema, registerSchema } from "./schemas.js";

export type AuthUser = { id: string; email: string; name: string; workspaceId: string };

declare module "fastify" {
  interface FastifyRequest {
    user: AuthUser;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthUser;
    user: AuthUser;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ message: "Необходима авторизация" });
  }
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return reply.code(409).send({ message: "Этот email уже зарегистрирован" });

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash,
        memberships: {
          create: {
            role: "owner",
            workspace: { create: { name: `Рабочее пространство ${body.name}` } }
          }
        }
      },
      include: { memberships: true }
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      workspaceId: user.memberships[0].workspaceId
    };
    return { accessToken: app.jwt.sign(authUser), user: authUser };
  });

  app.post("/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: body.email }, include: { memberships: true } });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return reply.code(401).send({ message: "Неверный email или пароль" });
    }
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      workspaceId: user.memberships[0].workspaceId
    };
    return { accessToken: app.jwt.sign(authUser), user: authUser };
  });

  app.get("/auth/me", { preHandler: authenticate }, async (request) => ({ user: request.user }));
}
