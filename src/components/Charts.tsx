"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { useLocale } from "./LocaleContext";

export interface DomainDatum {
  label: string;
  accuracy: number;
  total: number;
}

const INK = "#1a1a1a";
const LINE = "#eae8e3";
const FAINT = "#8a8a86";
const ACCENT = "#5b5bd6";

function tooltipStyle() {
  return {
    contentStyle: {
      borderRadius: 12,
      border: `1px solid ${LINE}`,
      boxShadow: "0 12px 32px -12px rgba(26,26,26,0.15)",
      fontSize: 12,
      padding: "8px 12px",
    },
  } as const;
}

// Radar of per-domain accuracy.
export function AccuracyRadar({ data }: { data: DomainDatum[] }) {
  const { t } = useLocale();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke={LINE} />
        <PolarAngleAxis dataKey="label" tick={{ fill: INK, fontSize: 13 }} />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={{ fill: FAINT, fontSize: 10 }}
          tickCount={5}
          axisLine={false}
        />
        <Radar
          name={t("dash.kpi.accuracy")}
          dataKey="accuracy"
          stroke={ACCENT}
          strokeWidth={2}
          fill={ACCENT}
          fillOpacity={0.14}
        />
        <Tooltip
          {...tooltipStyle()}
          formatter={(v: number, _n, p: any) => [`${v}% · ${p.payload.total}`, t("dash.kpi.accuracy")]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export interface TagDatum {
  label: string;
  accuracy: number;
  total: number;
}

// Horizontal bar of per-tag accuracy (weakest first). Color-coded by level.
export function TagAccuracyBar({ data }: { data: TagDatum[] }) {
  const { t } = useLocale();
  const barColor = (v: number) => (v < 50 ? "#c65454" : v < 80 ? "#c98a2b" : "#3f9d6d");
  const height = Math.max(160, data.length * 36 + 16);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 28, top: 4, bottom: 4 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="label"
          width={150}
          tick={{ fill: INK, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          {...tooltipStyle()}
          cursor={{ fill: "rgba(26,26,26,0.03)" }}
          formatter={(v: number, _n, p: any) => [`${v}% · ${p.payload.total}`, t("dash.kpi.accuracy")]}
        />
        <Bar dataKey="accuracy" radius={[0, 5, 5, 0]} barSize={16}>
          {data.map((d, i) => (
            <Cell key={i} fill={barColor(d.accuracy)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
