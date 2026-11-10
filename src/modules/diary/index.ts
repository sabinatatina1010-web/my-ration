/**
 * Food diary domain module.
 * Manual meal logging and daily totals.
 */

export {
  createFoodEntry,
  deleteFoodEntry,
  getDiaryDay,
  orderedMealTypes,
  DiaryServiceError,
  type DiaryDayBundle,
  type DiaryDayTotals,
} from "@/modules/diary/service";
export {
  createFoodEntrySchema,
  mealTypeSchema,
  type CreateFoodEntryInput,
} from "@/modules/diary/schemas";
export { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from "@/modules/diary/labels";
export {
  createFoodEntryAction,
  deleteFoodEntryAction,
  estimateFoodFromTextAction,
  type DiaryFormState,
} from "@/modules/diary/actions";
export {
  calculateCaloriesFromMacros,
  normalizeMacros,
} from "@/modules/diary/macros";
export {
  estimateFoodNutrition,
  FoodEstimateError,
} from "@/modules/diary/food-estimate";
export { estimateMacrosLocally } from "@/modules/diary/food-estimate-local";
