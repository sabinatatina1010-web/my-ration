type ProgressMeterProps = {
  label: string;
  current: number;
  target: number;
  unit: string;
  accentClassName?: string;
};

export function ProgressMeter({
  label,
  current,
  target,
  unit,
  accentClassName = "bg-brand",
}: ProgressMeterProps) {
  const safeTarget = target > 0 ? target : 1;
  const ratio = Math.min(1, current / safeTarget);
  const percent = Math.round(ratio * 100);
  const remaining = Math.max(0, Math.round((target - current) * 10) / 10);

  return (
    <div className="rounded-2xl border border-brand/10 bg-white/70 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-foreground/70">{label}</p>
        <p className="text-sm font-semibold text-brand-deep">{percent}%</p>
      </div>
      <p className="mt-2 text-xl font-semibold text-brand-deep">
        {current}
        <span className="text-sm font-medium text-foreground/55">
          {" "}
          / {target} {unit}
        </span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand/10">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${accentClassName}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-foreground/55">
        Осталось {remaining} {unit}
      </p>
    </div>
  );
}
