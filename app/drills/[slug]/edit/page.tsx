"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DrillEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [drill, setDrill] = useState<any>(null);
  const [form, setForm] = useState({
    equipment: "",
    setup: "",
    instructions: "",
    coaching_points: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("drills")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        if (data) {
          setDrill(data);
          setForm({
            equipment: data.equipment || "",
            setup: data.setup || "",
            instructions: data.instructions || "",
            coaching_points: data.coaching_points || "",
          });
        }
      });
  }, [slug, supabase]);

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from("drills")
      .update({
        equipment: form.equipment || null,
        setup: form.setup || null,
        instructions: form.instructions || null,
        coaching_points: form.coaching_points || null,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug);
    setSaving(false);
    router.push(`/drills/${slug}`);
  };

  if (!drill) return <div className="py-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/drills/${slug}`}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Edit: {drill.name}</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Equipment</label>
          <input
            type="text"
            value={form.equipment}
            onChange={(e) => setForm({ ...form, equipment: e.target.value })}
            className="w-full border rounded-lg p-3 text-sm mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Setup</label>
          <textarea
            value={form.setup}
            onChange={(e) => setForm({ ...form, setup: e.target.value })}
            className="w-full border rounded-lg p-3 text-sm mt-1 min-h-[80px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Instructions</label>
          <textarea
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            className="w-full border rounded-lg p-3 text-sm mt-1 min-h-[120px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Coaching Points</label>
          <textarea
            value={form.coaching_points}
            onChange={(e) => setForm({ ...form, coaching_points: e.target.value })}
            className="w-full border rounded-lg p-3 text-sm mt-1 min-h-[80px]"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-slate-900 text-white font-medium py-3 rounded-lg active:bg-slate-800 min-h-[48px] disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
