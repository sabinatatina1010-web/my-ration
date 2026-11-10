export type MacroBreakdown = {
  calories: number;
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
};

/**
 * Classic Atwater factors: protein 4, carbs 4, fat 9 kcal/g.
 */
export function calculateCaloriesFromMacros(
  proteinGrams: number,
  fatGrams: number,
  carbsGrams: number,
): number {
  return Math.round(proteinGrams * 4 + fatGrams * 9 + carbsGrams * 4);
}

export function roundMacro(value: number): number {
  return Math.round(value * 10) / 10;
}

export function normalizeMacros(input: {
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
  calories?: number;
}): MacroBreakdown {
  const proteinGrams = roundMacro(Math.max(0, input.proteinGrams));
  const fatGrams = roundMacro(Math.max(0, input.fatGrams));
  const carbsGrams = roundMacro(Math.max(0, input.carbsGrams));
  const calculated = calculateCaloriesFromMacros(
    proteinGrams,
    fatGrams,
    carbsGrams,
  );

  return {
    proteinGrams,
    fatGrams,
    carbsGrams,
    calories:
      input.calories !== undefined && input.calories > 0
        ? Math.round(input.calories)
        : calculated,
  };
}
