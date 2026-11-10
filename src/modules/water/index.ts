/**
 * Water intake domain module.
 */

export {
  createWaterLog,
  deleteWaterLog,
  getWaterPageData,
  WaterServiceError,
} from "@/modules/water/service";
export {
  createWaterLogSchema,
  type CreateWaterLogInput,
} from "@/modules/water/schemas";
export {
  createWaterLogAction,
  deleteWaterLogAction,
  type WaterFormState,
} from "@/modules/water/actions";
