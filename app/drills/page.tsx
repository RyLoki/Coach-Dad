"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DrillCard } from "@/components/DrillCard";
import { Search } from "lucide-react";
import { CATEGORY_COLORS, LEVEL_COLORS } from "@/lib/tag-colors";
import type { DrillWithSource } from "@/lib/types";

const CATEGORIES = [
  "all",
  "warmup",
  "throwing",
  "hitting",
  "infield",
  "outfield",
  "pitching",
  "baserunning",
  "catcher",
  "fielding",
];

const LEVELS = ["all", "AAA", "Farm 2", "Tee Ball"];

export default function DrillsPage() {
  const [drills, setDrills] = useState<DrillWithSource[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("drills")
      .select("*, source_documents(storage_url)")
      .order("name")
      .then(({ data }) => setDrills((data as DrillWithSource[]) || []));
  }, []);

  const filtered = drills.filter((d) => {
    if (category !== "all" && d.category !== category) return false;
    if (level !== "all" && !d.level_tags.includes(level)) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Drills</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drills..."
          className="w-full pl-10 pr-4 py-3 border rounded-lg text-sm min-h-[44px]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-[32px] capitalize ${
              category === cat
                ? CATEGORY_COLORS[cat] || "bg-slate-900 text-white"
                : "bg-white border text-slate-600"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-[32px] ${
              level === lvl
                ? LEVEL_COLORS[lvl] || "bg-slate-900 text-white"
                : "bg-white border text-slate-600"
            }`}
          >
            {lvl === "all" ? "All Levels" : lvl}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} drills</p>

      <div className="space-y-3">
        {filtered.map((drill) => (
          <DrillCard key={drill.slug} drill={drill} />
        ))}
      </div>
    </div>
  );
}
