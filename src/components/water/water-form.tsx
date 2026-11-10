"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { createWaterLogAction } from "@/modules/water/actions";

const QUICK_AMOUNTS = [200, 250, 300, 500] as const;

export function WaterForm() {
  const [amount, setAmount] = useState("250");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submitAmount(value: string) {
    const formData = new FormData();
    formData.set("amountMl", value);

    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await createWaterLogAction(
        { error: null, success: null },
        formData,
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(result.success);
      setAmount("250");
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-brand/15 bg-surface p-6 backdrop-blur">
      <div>
        <h2 className="font-display text-2xl font-semibold text-brand-deep">
          Добавить воду
        </h2>
        <p className="mt-2 text-sm text-foreground/70">
          Быстрые кнопки или свой объём в миллилитрах.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((value) => (
          <Button
            key={value}
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => submitAmount(String(value))}
          >
            +{value} мл
          </Button>
        ))}
      </div>

      <form
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          submitAmount(amount);
        }}
      >
        <div className="flex-1">
          <TextField
            name="amountMl"
            type="number"
            label="Свой объём (мл)"
            required
            min={50}
            max={2000}
            step="50"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={pending} className="sm:mb-0">
          {pending ? "Добавляем…" : "Добавить"}
        </Button>
      </form>

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
    </div>
  );
}
