import { withPrisma } from "@/lib/prisma";
import {
  type LoginInput,
  type RegisterInput,
  loginSchema,
  registerSchema,
} from "@/modules/auth/schemas";
import { hashPassword, verifyPassword } from "@/modules/auth/password";

export class AuthServiceError extends Error {
  constructor(
    message: string,
    readonly code: "VALIDATION" | "EMAIL_TAKEN" | "INVALID_CREDENTIALS",
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

function toAuthUser(user: {
  id: string;
  email: string;
  name: string | null;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function registerUser(rawInput: unknown): Promise<AuthUser> {
  const parsed = registerSchema.safeParse(rawInput);

  if (!parsed.success) {
    throw new AuthServiceError(
      parsed.error.issues[0]?.message ?? "Некорректные данные",
      "VALIDATION",
    );
  }

  const input: RegisterInput = parsed.data;

  return withPrisma(async (db) => {
    const existing = await db.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existing) {
      throw new AuthServiceError(
        "Пользователь с таким email уже зарегистрирован",
        "EMAIL_TAKEN",
      );
    }

    const passwordHash = await hashPassword(input.password);

    const user = await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return toAuthUser(user);
  });
}

export async function authenticateUser(rawInput: unknown): Promise<AuthUser> {
  const parsed = loginSchema.safeParse(rawInput);

  if (!parsed.success) {
    throw new AuthServiceError(
      parsed.error.issues[0]?.message ?? "Некорректные данные",
      "VALIDATION",
    );
  }

  const input: LoginInput = parsed.data;

  return withPrisma(async (db) => {
    const user = await db.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
      },
    });

    if (!user?.passwordHash) {
      throw new AuthServiceError(
        "Неверный email или пароль",
        "INVALID_CREDENTIALS",
      );
    }

    const passwordMatches = await verifyPassword(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AuthServiceError(
        "Неверный email или пароль",
        "INVALID_CREDENTIALS",
      );
    }

    return toAuthUser(user);
  });
}
