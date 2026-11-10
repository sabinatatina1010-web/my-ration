import assert from "node:assert/strict";
import { estimateMacrosLocally } from "../src/modules/diary/food-estimate-local.ts";
import { calculateCaloriesFromMacros } from "../src/modules/diary/macros.ts";

const omelet = estimateMacrosLocally(
  "омлет из 2 яиц , вафля небольшая сладкая. 2 яйца омлет кусок хлеба и вафелька",
);

assert.ok(omelet, "local estimate should match omelet/waffle/bread");
assert.ok(omelet.calories > 200, "calories should be realistic");
assert.ok(omelet.proteinGrams > 20);

const fromMacros = calculateCaloriesFromMacros(38, 14, 42);
assert.equal(fromMacros, 446);

console.log("FOOD_ESTIMATE_SMOKE_OK", omelet);
