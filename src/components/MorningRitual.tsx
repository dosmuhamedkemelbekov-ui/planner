"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const QUESTIONS = [
  "Что сделаю сегодня, чтобы приблизиться к цели?",
  "За что я благодарен сегодня?",
  "Как я позабочусь о себе сегодня?",
];

type Ritual = { id?: string; q1: string | null; q2: string | null; q3: string | null } | null;

export default function MorningRitual({
  initialRitual,
  today,
}: {
  initialRitual: Ritual;
  today: string;
}) {
  const [q1, setQ1] = useState(initialRitual?.q1 ?? "");
  const [q2, setQ2] = useState(initialRitual?.q2 ?? "");
  const [q3, setQ3] = useState(initialRitual?.q3 ?? "");
  const [saved, setSaved] = useState(!!initialRitual?.q1);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (initialRitual?.id) {
      await supabase
        .from("morning_ritual")
        .update({ q1: q1 || null, q2: q2 || null, q3: q3 || null, updated_at: new Date().toISOString() })
        .eq("id", initialRitual.id);
    } else {
      await supabase.from("morning_ritual").upsert({
        user_id: user.id,
        ritual_date: today,
        q1: q1 || null,
        q2: q2 || null,
        q3: q3 || null,
      }, { onConflict: "user_id,ritual_date" });
    }
    setSaved(true);
    setLoading(false);
  }

  return (
    <section className="rounded-2xl bg-dark-800 border border-dark-600 p-6 card-hover animate-slide-up">
      <h2 className="text-lg font-semibold text-white mb-4">Утренний ритуал</h2>
      <form onSubmit={handleSave} className="space-y-4">
        {QUESTIONS.map((q, i) => (
          <div key={i}>
            <label className="block text-sm text-gray-400 mb-1">{q}</label>
            <input
              value={[q1, q2, q3][i]}
              onChange={(e) => {
                if (i === 0) setQ1(e.target.value);
                if (i === 1) setQ2(e.target.value);
                if (i === 2) setQ3(e.target.value);
              }}
              className="w-full px-4 py-2 rounded-xl bg-dark-700 border border-dark-500 text-white placeholder-gray-500 focus:border-accent outline-none text-sm"
              placeholder="Ваш ответ..."
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? "..." : saved ? "Обновить ответы" : "Сохранить"}
        </button>
      </form>
    </section>
  );
}
