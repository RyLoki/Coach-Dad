"use client";

import { useState } from "react";
import { Check, Square } from "lucide-react";

type Props = {
  plays: string[];
  blockId: number;
};

export function DefensivePlaysCard({ plays, blockId }: Props) {
  const [doneIndices, setDoneIndices] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setDoneIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-lg border p-4 space-y-2" data-block-id={blockId}>
      <h4 className="font-semibold text-sm text-slate-700">Defensive Plays</h4>
      <ul className="space-y-2">
        {plays.map((play, idx) => (
          <li key={idx}>
            <button
              onClick={() => toggle(idx)}
              className="flex items-start gap-3 w-full text-left min-h-[44px] py-1"
            >
              {doneIndices.has(idx) ? (
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <Square className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
              )}
              <span className={doneIndices.has(idx) ? "line-through text-slate-400" : ""}>
                {play}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
