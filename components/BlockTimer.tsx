"use client";

import { useEffect, useState } from "react";
import { formatElapsed } from "@/lib/time";

type Props = {
  startedAt: string; // ISO string of when practice started
  blocks: { start_offset_min: number; duration_min: number; title: string }[];
};

export function BlockTimer({ startedAt, blocks }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const elapsedMin = elapsed / 60;

  const currentIdx = blocks.findIndex(
    (b) => elapsedMin >= b.start_offset_min && elapsedMin < b.start_offset_min + b.duration_min
  );
  const current = currentIdx >= 0 ? blocks[currentIdx] : null;
  const next = currentIdx >= 0 && currentIdx < blocks.length - 1 ? blocks[currentIdx + 1] : null;

  const blockElapsed = current ? elapsed - current.start_offset_min * 60 : 0;
  const blockRemaining = current ? current.duration_min * 60 - blockElapsed : 0;

  return (
    <div className="bg-slate-900 text-white rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-400">Practice Time</span>
        <span className="font-mono text-lg">{formatElapsed(elapsed)}</span>
      </div>

      {current && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-semibold">{current.title}</span>
            <span className="font-mono text-sm text-amber-400">
              {formatElapsed(Math.max(0, Math.floor(blockRemaining)))} left
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, (blockElapsed / (current.duration_min * 60)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {!current && elapsed > 0 && (
        <p className="text-sm text-slate-400">Practice complete!</p>
      )}

      {next && (
        <p className="text-xs text-slate-400">
          Up next: {next.title} ({next.duration_min}min)
        </p>
      )}
    </div>
  );
}
