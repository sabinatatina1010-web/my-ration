import {
  normalizeMacros,
  type MacroBreakdown,
} from "@/modules/diary/macros";

type FoodRule = {
  patterns: RegExp[];
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
  defaultUnits?: number;
};

const FOOD_RULES: FoodRule[] = [
  {
    patterns: [/яйц/i, /омлет/i],
    proteinGrams: 12.6,
    fatGrams: 10.6,
    carbsGrams: 0.7,
    defaultUnits: 2,
  },
  {
    patterns: [/вафл/i],
    proteinGrams: 3.5,
    fatGrams: 5,
    carbsGrams: 22,
    defaultUnits: 1,
  },
  {
    patterns: [/хлеб/i, /тост/i],
    proteinGrams: 3,
    fatGrams: 1,
    carbsGrams: 15,
    defaultUnits: 1,
  },
  {
    patterns: [/курин/i, /куриц/i],
    proteinGrams: 31,
    fatGrams: 3.6,
    carbsGrams: 0,
    defaultUnits: 1,
  },
  {
    patterns: [/гречк/i],
    proteinGrams: 4.5,
    fatGrams: 1,
    carbsGrams: 25,
    defaultUnits: 1,
  },
  {
    patterns: [/рис/i],
    proteinGrams: 2.7,
    fatGrams: 0.3,
    carbsGrams: 28,
    defaultUnits: 1,
  },
  {
    patterns: [/творог/i],
    proteinGrams: 18,
    fatGrams: 5,
    carbsGrams: 3,
    defaultUnits: 1,
  },
  {
    patterns: [/банан/i],
    proteinGrams: 1.1,
    fatGrams: 0.3,
    carbsGrams: 23,
    defaultUnits: 1,
  },
  {
    patterns: [/яблок/i],
    proteinGrams: 0.4,
    fatGrams: 0.4,
    carbsGrams: 14,
    defaultUnits: 1,
  },
  {
    patterns: [/йогурт/i],
    proteinGrams: 5,
    fatGrams: 3,
    carbsGrams: 7,
    defaultUnits: 1,
  },
  {
    patterns: [/сыр/i],
    proteinGrams: 7,
    fatGrams: 9,
    carbsGrams: 0.5,
    defaultUnits: 1,
  },
  {
    patterns: [/масло/i],
    proteinGrams: 0,
    fatGrams: 10,
    carbsGrams: 0,
    defaultUnits: 1,
  },
];

function extractQuantity(text: string, pattern: RegExp): number | null {
  const before = text.match(
    new RegExp(`(\\d+[.,]?\\d*)\\s*(?:шт|штук|яйц)?\\s*${pattern.source}`, "i"),
  );
  if (before?.[1]) {
    return Number(before[1].replace(",", "."));
  }

  const after = text.match(
    new RegExp(`${pattern.source}\\s*(?:из\\s*)?(\\d+[.,]?\\d*)`, "i"),
  );
  if (after?.[1]) {
    return Number(after[1].replace(",", "."));
  }

  return null;
}

export function estimateMacrosLocally(text: string): MacroBreakdown | null {
  const normalized = text.trim();
  if (!normalized) {
    return null;
  }

  let proteinGrams = 0;
  let fatGrams = 0;
  let carbsGrams = 0;
  let matched = false;

  for (const rule of FOOD_RULES) {
    const hit = rule.patterns.some((pattern) => pattern.test(normalized));
    if (!hit) {
      continue;
    }

    matched = true;
    const quantity =
      extractQuantity(normalized, rule.patterns[0]) ?? rule.defaultUnits ?? 1;

    proteinGrams += rule.proteinGrams * quantity;
    fatGrams += rule.fatGrams * quantity;
    carbsGrams += rule.carbsGrams * quantity;
  }

  if (!matched) {
    return null;
  }

  return normalizeMacros({ proteinGrams, fatGrams, carbsGrams });
}
