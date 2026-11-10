"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { createWeightLogAction } from "@/modules/weight/actions";

type WeightFormProps = {
  defaultWeightKg?: number | null;
};

export function WeightForm({ defaultWeightKg }: WeightFormProps) {
  const [weight, setWeight] = useState(
    defaultWeightKg != null ? String(defaultWeightKg) : "",
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-5 rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.set("weightKg", weight);
        formData.set("note", note);

        startTransition(async () => {
          setError(null);
          setSuccess(null);
          const result = await createWeightLogAction(
            { error: null, success: null },
            formData,
          );

          if (result.error) {
            setError(result.error);
            return;
          }

          setSuccess(result.success);
          setNote("");
        });
      }}
    >
      <div>
        <h2 className="font-display text-2xl font-semibold text-brand-deep">
          Записать вес
        </h2>
        <p className="mt-2 text-sm text-foreground/70">
          Новый замер появится на графике и обновит вес в анкете.
        </p>
      </div>

      <TextField
        name="weightKg"
        type="number"
        label="Вес (кг)"
        required
        min={30}
        max={300}
        step="0.1"
        value={weight}
        onChange={(event) => setWeight(event.target.value)}
        placeholder="Например: 68.5"
      />

      <TextareaField
        name="note"
        label="Заметка (необязательно)"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Утро, натощак..."
      />

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

      <Button type="submit" disabled={pending} className="sm:w-fit">
        {pending ? "Сохраняем…" : "Сохранить вес"}
      </Button>
    </form>
  );
}
