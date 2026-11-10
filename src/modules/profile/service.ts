import { withPrisma } from "@/lib/prisma";
import { calculateNutritionTargets } from "@/modules/profile/calculations";
import {
  profileQuestionnaireSchema,
  type ProfileQuestionnaireInput,
} from "@/modules/profile/schemas";

export class ProfileServiceError extends Error {
  constructor(
    message: string,
    readonly code: "VALIDATION" | "NOT_FOUND" | "UNAUTHORIZED",
  ) {
    super(message);
    this.name = "ProfileServiceError";
  }
}

export async function getProfileBundle(userId: string) {
  return withPrisma(async (db) => {
    // Sequential on purpose: local prisma dev allows one connection.
    const profile = await db.userProfile.findUnique({ where: { userId } });
    const nutritionTarget = await db.nutritionTarget.findUnique({
      where: { userId },
    });

    return { profile, nutritionTarget };
  });
}

export async function isOnboardingCompleted(userId: string): Promise<boolean> {
  return withPrisma(async (db) => {
    const profile = await db.userProfile.findUnique({
      where: { userId },
      select: { onboardingCompleted: true },
    });

    return Boolean(profile?.onboardingCompleted);
  });
}

export async function saveProfileQuestionnaire(
  userId: string,
  rawInput: unknown,
) {
  const parsed = profileQuestionnaireSchema.safeParse(rawInput);

  if (!parsed.success) {
    throw new ProfileServiceError(
      parsed.error.issues[0]?.message ?? "Некорректные данные анкеты",
      "VALIDATION",
    );
  }

  const input: ProfileQuestionnaireInput = parsed.data;
  const targets = calculateNutritionTargets(input);

  return withPrisma(async (db) => {
    const [profile, nutritionTarget] = await db.$transaction([
      db.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          sex: input.sex,
          ageYears: input.ageYears,
          heightCm: input.heightCm,
          weightKg: input.weightKg,
          targetWeightKg: input.targetWeightKg,
          activityLevel: input.activityLevel,
          goal: input.goal,
          onboardingCompleted: true,
        },
        update: {
          sex: input.sex,
          ageYears: input.ageYears,
          heightCm: input.heightCm,
          weightKg: input.weightKg,
          targetWeightKg: input.targetWeightKg ?? null,
          activityLevel: input.activityLevel,
          goal: input.goal,
          onboardingCompleted: true,
        },
      }),
      db.nutritionTarget.upsert({
        where: { userId },
        create: {
          userId,
          calories: targets.calories,
          proteinGrams: targets.proteinGrams,
          fatGrams: targets.fatGrams,
          carbsGrams: targets.carbsGrams,
          waterMl: targets.waterMl,
          calculatedAt: new Date(),
        },
        update: {
          calories: targets.calories,
          proteinGrams: targets.proteinGrams,
          fatGrams: targets.fatGrams,
          carbsGrams: targets.carbsGrams,
          waterMl: targets.waterMl,
          calculatedAt: new Date(),
        },
      }),
    ]);

    return {
      profile,
      nutritionTarget,
      calculation: targets,
    };
  });
}
