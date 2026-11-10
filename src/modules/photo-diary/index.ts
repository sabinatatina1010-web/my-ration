/**
 * AI photo diary domain module.
 * Image upload, Vision analysis, and diary logging.
 */

export {
  analyzeFoodPhoto,
  PhotoAnalysisError,
  type PhotoAnalysisResult,
} from "@/modules/photo-diary/analyze";
export {
  savePhotoFoodEntry,
  PhotoDiaryServiceError,
} from "@/modules/photo-diary/service";
export {
  storeFoodPhoto,
  PhotoStorageError,
  type StoredPhoto,
} from "@/modules/photo-diary/storage";
export {
  analyzeFoodPhotoAction,
  confirmPhotoFoodEntryAction,
  type AnalyzePhotoResult,
  type ConfirmPhotoResult,
} from "@/modules/photo-diary/actions";
export {
  photoAnalysisSchema,
  confirmPhotoEntrySchema,
  type PhotoAnalysis,
  type ConfirmPhotoEntryInput,
} from "@/modules/photo-diary/schemas";
