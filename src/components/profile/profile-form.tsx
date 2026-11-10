"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  SEX_LABELS,
} from "@/modules/profile/labels";
import {
  saveProfileAction,
  type ProfileFormState,
} from "@/modules/profile/actions";

type ProfileFormProps = {
  initialValues?: {
    sex?: string;
    ageYears?: number | null;
    heightCm?: number | null;
    weightKg?: number | null;
    targetWeightKg?: number | null;
    activityLevel?: string;
    goal?: string;
  };
  submitLabel?: string;
};

const initialState: ProfileFormState = { error: null };

const sexOptions = Object.entries(SEX_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const activityOptions = Object.entries(ACTIVITY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const goalOptions = Object.entries(GOAL_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function ProfileForm({
  initialValues,
  submitLabel = "Рассчитать нормы",
}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    saveProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          name="sex"
          label="Пол"
          required
          defaultValue={initialValues?.sex ?? "FEMALE"}
          options={sexOptions}
        />
        <TextField
          name="ageYears"
          type="number"
          label="Возраст (лет)"
          required
          min={14}
          max={100}
          defaultValue={initialValues?.ageYears ?? undefined}
          placeholder="32"
        />
        <TextField
          name="heightCm"
          type="number"
          label="Рост (см)"
          required
          min={120}
          max={230}
          step="0.1"
          defaultValue={initialValues?.heightCm ?? undefined}
          placeholder="165"
        />
        <TextField
          name="weightKg"
          type="number"
          label="Текущий вес (кг)"
          required
          min={30}
          max={300}
          step="0.1"
          defaultValue={initialValues?.weightKg ?? undefined}
          placeholder="72"
        />
        <TextField
          name="targetWeightKg"
          type="number"
          label="Целевой вес (кг, необязательно)"
          min={30}
          max={300}
          step="0.1"
          defaultValue={initialValues?.targetWeightKg ?? undefined}
          placeholder="65"
        />
        <SelectField
          name="goal"
          label="Цель"
          required
          defaultValue={initialValues?.goal ?? "LOSE_WEIGHT"}
          options={goalOptions}
        />
      </div>

      <SelectField
        name="activityLevel"
        label="Уровень активности"
        required
        defaultValue={initialValues?.activityLevel ?? "LIGHT"}
        options={activityOptions}
      />

      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="sm:w-fit">
        {pending ? "Считаем…" : submitLabel}
      </Button>
    </form>
  );
}
