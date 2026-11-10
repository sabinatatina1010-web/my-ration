import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите имя")
    .max(80, "Имя слишком длинное"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Некорректный email"),
  password: z
    .string()
    .min(8, "Пароль должен быть не короче 8 символов")
    .max(72, "Пароль слишком длинный"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Некорректный email"),
  password: z
    .string()
    .min(1, "Введите пароль")
    .max(72, "Пароль слишком длинный"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
