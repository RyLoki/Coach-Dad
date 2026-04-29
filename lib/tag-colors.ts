export const LEVEL_COLORS: Record<string, string> = {
  AAA: "bg-red-50 text-red-700",
  "Farm 2": "bg-green-50 text-green-700",
  "Tee Ball": "bg-purple-50 text-purple-700",
};

export const CATEGORY_COLORS: Record<string, string> = {
  warmup: "bg-orange-100 text-orange-800",
  throwing: "bg-sky-100 text-sky-800",
  hitting: "bg-red-100 text-red-800",
  infield: "bg-amber-100 text-amber-800",
  outfield: "bg-emerald-100 text-emerald-800",
  pitching: "bg-indigo-100 text-indigo-800",
  baserunning: "bg-teal-100 text-teal-800",
  catcher: "bg-slate-200 text-slate-800",
  fielding: "bg-lime-100 text-lime-800",
  stations: "bg-violet-100 text-violet-800",
  situational: "bg-rose-100 text-rose-800",
  game: "bg-blue-100 text-blue-800",
};

export function levelColor(tag: string) {
  return LEVEL_COLORS[tag] || "bg-slate-100 text-slate-600";
}

export function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] || "bg-slate-100 text-slate-600";
}
