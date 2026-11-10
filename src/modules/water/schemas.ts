import { z } from "zod";

export const createWaterLogSchema = z.object({
  amountMl: z.coerce
    .number()
    .int("Объём должен быть целым числом")
    .min(50, "Минимум 50 мл")
    .max(2000, "За один раз максимум 2000 мл"),
});

export type CreateWaterLogInput = z.infer<typeof createWaterLogSchema>;
