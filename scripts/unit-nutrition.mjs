import assert from "node:assert/strict";
import {
  calculateBmr,
  calculateNutritionTargets,
} from "../src/modules/profile/calculations.ts";

const femaleBmr = calculateBmr("FEMALE", 70, 168, 30);
assert.equal(femaleBmr, 10 * 70 + 6.25 * 168 - 5 * 30 - 161);

const maleBmr = calculateBmr("MALE", 80, 180, 28);
assert.equal(maleBmr, 10 * 80 + 6.25 * 180 - 5 * 28 + 5);

const lose = calculateNutritionTargets({
  sex: "FEMALE",
  ageYears: 30,
  heightCm: 168,
  weightKg: 70,
  activityLevel: "LIGHT",
  goal: "LOSE_WEIGHT",
});

assert.ok(lose.calories >= 1200);
assert.equal(lose.proteinGrams, 140);
assert.ok(lose.waterMl >= 2000);
assert.ok(lose.bmr > 0 && lose.tdee > lose.bmr);

const maintain = calculateNutritionTargets({
  sex: "MALE",
  ageYears: 28,
  heightCm: 180,
  weightKg: 80,
  activityLevel: "MODERATE",
  goal: "MAINTAIN",
});

assert.ok(maintain.calories >= 1500);
assert.ok(maintain.calories > lose.calories);

console.log("UNIT_NUTRITION_OK", {
  femaleBmr: Math.round(femaleBmr),
  loseCalories: lose.calories,
  maintainCalories: maintain.calories,
});
