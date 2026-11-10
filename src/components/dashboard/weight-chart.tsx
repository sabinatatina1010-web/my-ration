"use client";

import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeightChartProps = {
  data: Array<{
    date: string;
    weightKg: number;
  }>;
  fallbackWeightKg: number;
};

export function WeightChart({ data, fallbackWeightKg }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-brand/20 bg-white/50 px-6 text-center">
        <p className="font-medium text-brand-deep">Пока нет замеров веса</p>
        <p className="mt-2 max-w-sm text-sm text-foreground/65">
          Стартовый вес из анкеты: <strong>{fallbackWeightKg} кг</strong>.
          Добавьте замер на странице{" "}
          <Link href="/weight" className="font-semibold text-brand-deep underline-offset-4 hover:underline">
            Вес
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(47, 107, 79, 0.12)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#5b6b62", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{ fill: "#5b6b62", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(47, 107, 79, 0.15)",
              background: "rgba(255,255,255,0.95)",
            }}
            formatter={(value) => [`${String(value)} кг`, "Вес"]}
          />
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke="#2f6b4f"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#2f6b4f" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
