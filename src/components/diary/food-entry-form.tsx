"use client";

import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { MEAL_TYPE_LABELS } from "@/modules/diary/labels";
import { calculateCaloriesFromMacros } from "@/modules/diary/macros";
import {
  createFoodEntryAction,
  estimateFoodFromTextAction,
} from "@/modules/diary/actions";

const mealOptions = Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function toInputNumber(value: string): number {
  if (!value.trim()) {
    return 0;
  }
  return Number(value.replace(",", "."));
}

const emptyForm = {
  name: "",
  description: "",
  protein: "",
  fat: "",
  carbs: "",
  calories: "",
  portion: "",
};

export function FoodEntryForm() {
  const [form, setForm] = useState(emptyForm);
  const [caloriesTouched, setCaloriesTouched] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [estimatePending, startEstimate] = useTransition();
  const [createPending, startCreate] = useTransition();

  const autoCalories = useMemo(
    () =>
      calculateCaloriesFromMacros(
        toInputNumber(form.protein),
        toInputNumber(form.fat),
        toInputNumber(form.carbs),
      ),
    [form.protein, form.fat, form.carbs],
  );

  const hasMacros = Boolean(form.protein || form.fat || form.carbs);
  const caloriesValue =
    caloriesTouched || !hasMacros ? form.calories : String(autoCalories);

  function updateField<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(null);
  }

  function resetForm() {
    setForm(emptyForm);
    setCaloriesTouched(false);
    setHint(null);
    setError(null);
  }

  return (
    <form
      className="flex flex-col gap-5 rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.set("calories", caloriesValue || "0");

        startCreate(async () => {
          setError(null);
          setSuccess(null);
          const result = await createFoodEntryAction(
            { error: null, success: null },
            formData,
          );

          if (result.error) {
            setError(result.error);
            return;
          }

          setSuccess(result.success);
          resetForm();
        });
      }}
    >
      <div>
        <h2 className="font-display text-2xl font-semibold text-brand-deep">
          Добавить блюдо
        </h2>
        <p className="mt-2 text-sm text-foreground/70">
          Напишите блюдо и нажмите «Рассчитать» — или введите БЖУ, калории
          посчитаются сами.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          name="mealType"
          label="Приём пищи"
          required
          defaultValue="BREAKFAST"
          options={mealOptions}
        />
        <TextField
          name="name"
          label="Название"
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="Например: омлет из 2 яиц и вафля"
        />
        <TextField
          name="proteinGrams"
          type="number"
          label="Белки (г)"
          required
          min={0}
          step="0.1"
          value={form.protein}
          onChange={(event) => updateField("protein", event.target.value)}
          placeholder="Введите белки"
        />
        <TextField
          name="fatGrams"
          type="number"
          label="Жиры (г)"
          required
          min={0}
          step="0.1"
          value={form.fat}
          onChange={(event) => updateField("fat", event.target.value)}
          placeholder="Введите жиры"
        />
        <TextField
          name="carbsGrams"
          type="number"
          label="Углеводы (г)"
          required
          min={0}
          step="0.1"
          value={form.carbs}
          onChange={(event) => updateField("carbs", event.target.value)}
          placeholder="Введите углеводы"
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
            updateField("calories", event.target.value);
          }}
          placeholder="Считаются автоматически"
        />
        <TextField
          name="portionGrams"
          type="number"
          label="Порция (г, необязательно)"
          min={1}
          step="1"
          value={form.portion}
          onChange={(event) => updateField("portion", event.target.value)}
          placeholder="Например: 250"
        />
      </div>

      <TextareaField
        name="description"
        label="Описание (необязательно)"
        value={form.description}
        onChange={(event) => updateField("description", event.target.value)}
        placeholder="Состав: 2 яйца, хлеб, вафля..."
      />

      {hint ? (
        <p className="rounded-xl border border-brand/20 bg-brand/10 px-4 py-3 text-sm text-brand-deep">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-brand/20 bg-brand/10 px-4 py-3 text-sm text-brand-deep">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={estimatePending || !form.name.trim()}
          onClick={() => {
            startEstimate(async () => {
              setError(null);
              const result = await estimateFoodFromTextAction({
                name: form.name,
                description: form.description,
              });

              if (result.error || !result.estimate) {
                setError(result.error ?? "Не удалось рассчитать");
                return;
              }

              const next = result.estimate;
              setForm((prev) => ({
                ...prev,
                protein: String(next.proteinGrams),
                fat: String(next.fatGrams),
                carbs: String(next.carbsGrams),
                calories: String(next.calories),
                portion: next.portionGrams
                  ? String(next.portionGrams)
                  : prev.portion,
              }));
              setCaloriesTouched(false);
              setHint(next.note);
            });
          }}
        >
          {estimatePending ? "Считаем…" : "Рассчитать по названию"}
        </Button>
        <Button type="submit" disabled={createPending}>
          {createPending ? "Сохраняем…" : "Добавить в дневник"}
        </Button>
      </div>
    </form>
  );
}
