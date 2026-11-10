"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { MEAL_TYPE_LABELS } from "@/modules/diary/labels";
import { calculateCaloriesFromMacros } from "@/modules/diary/macros";
import {
  analyzeFoodPhotoAction,
  confirmPhotoFoodEntryAction,
} from "@/modules/photo-diary/actions";
import type { PhotoAnalysis } from "@/modules/photo-diary/schemas";

type PhotoDiaryClientProps = {
  openAiConfigured: boolean;
};

const mealOptions = Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

type Draft = {
  mealType: string;
  name: string;
  description: string;
  protein: string;
  fat: string;
  carbs: string;
  calories: string;
  portion: string;
};

const emptyDraft: Draft = {
  mealType: "LUNCH",
  name: "",
  description: "",
  protein: "",
  fat: "",
  carbs: "",
  calories: "",
  portion: "",
};

function toNumber(value: string): number {
  if (!value.trim()) return 0;
  return Number(value.replace(",", "."));
}

export function PhotoDiaryClient({ openAiConfigured }: PhotoDiaryClientProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [caloriesTouched, setCaloriesTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [analyzePending, startAnalyze] = useTransition();
  const [confirmPending, startConfirm] = useTransition();

  const autoCalories = useMemo(
    () =>
      calculateCaloriesFromMacros(
        toNumber(draft.protein),
        toNumber(draft.fat),
        toNumber(draft.carbs),
      ),
    [draft.protein, draft.fat, draft.carbs],
  );

  const hasMacros = Boolean(draft.protein || draft.fat || draft.carbs);
  const caloriesValue =
    caloriesTouched || !hasMacros ? draft.calories : String(autoCalories);

  function applyAnalysis(analysis: PhotoAnalysis) {
    setDraft({
      mealType: analysis.mealType,
      name: analysis.name,
      description: analysis.description ?? "",
      protein: String(analysis.proteinGrams),
      fat: String(analysis.fatGrams),
      carbs: String(analysis.carbsGrams),
      calories: String(analysis.calories),
      portion: analysis.portionGrams ? String(analysis.portionGrams) : "",
    });
    setCaloriesTouched(false);
  }

  if (!openAiConfigured) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
        <h2 className="font-display text-2xl font-semibold text-amber-950">
          AI-фотодневник пока недоступен
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-900/90">
          Для распознавания еды нужен ключ OpenAI. Добавьте в файл{" "}
          <code className="rounded bg-white/70 px-1.5 py-0.5">.env</code> строку{" "}
          <code className="rounded bg-white/70 px-1.5 py-0.5">
            OPENAI_API_KEY=ваш_ключ
          </code>
          , перезапустите сервер и откройте эту страницу снова. Пока ключа нет,
          используйте ручной дневник.
        </p>
        <div className="mt-6">
          <Link
            href="/diary"
            className="inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            Открыть ручной дневник
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-brand-deep">
          1. Загрузите фото
        </h2>
        <p className="mt-2 text-sm text-foreground/70">
          JPG, PNG или WEBP до 5 МБ. AI распознает продукты и оценит БЖУ.
        </p>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            startAnalyze(async () => {
              setError(null);
              setSuccess(null);
              const result = await analyzeFoodPhotoAction(formData);
              if (result.error || !result.analysis || !result.photoUrl) {
                setError(result.error ?? "Не удалось проанализировать фото");
                return;
              }

              setPhotoUrl(result.photoUrl);
              setRawJson(result.rawJson);
              applyAnalysis(result.analysis);
            });
          }}
        >
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="block w-full text-sm text-foreground/80 file:mr-4 file:rounded-xl file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-deep"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                setPreviewUrl(null);
                return;
              }
              setPreviewUrl(URL.createObjectURL(file));
              setSuccess(null);
              setError(null);
            }}
          />

          {previewUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-brand/15 bg-white/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Превью загруженного блюда"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <Button type="submit" disabled={analyzePending} className="sm:w-fit">
            {analyzePending ? "AI анализирует…" : "Распознать еду на фото"}
          </Button>
        </form>
      </section>

      <section className="rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-brand-deep">
          2. Проверьте и сохраните
        </h2>
        <p className="mt-2 text-sm text-foreground/70">
          Оценка ориентировочная — можно поправить поля перед добавлением в
          дневник.
        </p>

        {photoUrl ? (
          <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl border border-brand/15">
            <Image
              src={photoUrl}
              alt="Сохранённое фото блюда"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : null}

        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!photoUrl) {
              setError("Сначала загрузите и распознайте фото");
              return;
            }

            const formData = new FormData(event.currentTarget);
            formData.set("calories", caloriesValue || "0");
            formData.set("photoUrl", photoUrl);
            if (rawJson) {
              formData.set("aiRawResponse", rawJson);
            }

            startConfirm(async () => {
              setError(null);
              setSuccess(null);
              const result = await confirmPhotoFoodEntryAction(formData);
              if (result.error) {
                setError(result.error);
                return;
              }
              setSuccess(result.success);
              setDraft(emptyDraft);
              setPhotoUrl(null);
              setRawJson(null);
              setPreviewUrl(null);
              setCaloriesTouched(false);
            });
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              name="mealType"
              label="Приём пищи"
              required
              value={draft.mealType}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, mealType: event.target.value }))
              }
              options={mealOptions}
            />
            <TextField
              name="name"
              label="Название"
              required
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Распознанное блюдо"
            />
            <TextField
              name="proteinGrams"
              type="number"
              label="Белки (г)"
              required
              min={0}
              step="0.1"
              value={draft.protein}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, protein: event.target.value }))
              }
            />
            <TextField
              name="fatGrams"
              type="number"
              label="Жиры (г)"
              required
              min={0}
              step="0.1"
              value={draft.fat}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, fat: event.target.value }))
              }
            />
            <TextField
              name="carbsGrams"
              type="number"
              label="Углеводы (г)"
              required
              min={0}
              step="0.1"
              value={draft.carbs}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, carbs: event.target.value }))
              }
            />
            <TextField
              name="calories"
              type="number"
              label="Калории (ккал)"
              required
              min={0}
              step="1"
              value={caloriesValue}
              onChange={(event) => {
                setCaloriesTouched(true);
                setDraft((prev) => ({
                  ...prev,
                  calories: event.target.value,
                }));
              }}
            />
            <TextField
              name="portionGrams"
              type="number"
              label="Порция (г)"
              min={1}
              step="1"
              value={draft.portion}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, portion: event.target.value }))
              }
            />
          </div>

          <TextareaField
            name="description"
            label="Описание"
            value={draft.description}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-xl border border-brand/20 bg-brand/10 px-4 py-3 text-sm text-brand-deep">
              {success}{" "}
              <Link href="/diary" className="font-semibold underline-offset-4 hover:underline">
                Открыть дневник
              </Link>
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={confirmPending || !photoUrl}
            className="sm:w-fit"
          >
            {confirmPending ? "Сохраняем…" : "Добавить в дневник"}
          </Button>
        </form>
      </section>
    </div>
  );
}
