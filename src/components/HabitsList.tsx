"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Habit } from "@/lib/types";

export default function HabitsList({ habits: initial }: { habits: Habit[] }) {
  const router = useRouter();
  const [habits, setHabits] = useState(initial);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("habits")
      .insert({ user_id: user.id, title: newTitle.trim() })
      .select()
      .single();
    if (data) setHabits((h) => [...h, data]);
    setNewTitle("");
    setLoading(false);
    router.refresh();
  }

  async function deleteHabit(id: string) {
    await supabase.from("habits").delete().eq("id", id);
    setHabits((h) => h.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addHabit} className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Новая привычка"
          className="flex-1 px-4 py-3 rounded-xl bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-accent outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium transition disabled:opacity-50"
        >
          Добавить
        </button>
      </form>

      <ul className="space-y-3">
        {habits.map((h) => (
          <li
            key={h.id}
            className="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-dark-600 card-hover animate-slide-up"
          >
            <span className="text-white">{h.title}</span>
            <div className="flex items-center gap-3">
              <span className="text-accent font-medium">🔥 {h.streak}</span>
              <button
                type="button"
                onClick={() => deleteHabit(h.id)}
                className="text-gray-500 hover:text-red-400 text-sm"
              >
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>

      {habits.length === 0 && (
        <p className="text-gray-500 text-sm py-8 text-center">
          Добавьте первую привычку — например «Зарядка», «Читать 20 мин».
        </p>
      )}
    </div>
  );
}
