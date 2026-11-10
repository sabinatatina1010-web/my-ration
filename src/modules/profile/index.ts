/**
 * Profile domain module.
 * Questionnaire, Mifflin–St Jeor targets, and persistence.
 */

export {
  calculateBmr,
  calculateNutritionTargets,
  type NutritionCalculationInput,
  type NutritionCalculationResult,
} from "@/modules/profile/calculations";
export {
  profileQuestionnaireSchema,
  type ProfileQuestionnaireInput,
} from "@/modules/profile/schemas";
export {
  getProfileBundle,
  isOnboardingCompleted,
  saveProfileQuestionnaire,
  ProfileServiceError,
} from "@/modules/profile/service";
export { saveProfileAction, type ProfileFormState } from "@/modules/profile/actions";
export {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  SEX_LABELS,
} from "@/modules/profile/labels";
