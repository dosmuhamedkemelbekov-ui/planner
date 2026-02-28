"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Habit } from "@/lib/types";

export default function TodayHabits({
  habits,
  doneIds,
  today,
}: {
  habits: Habit[];
  doneIds: Set<string>;
  today: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function toggleHabit(habit: Habit) {
    const done = doneIds.has(habit.id);
    if (done) {
      await supabase.from("habit_logs").delete().eq("habit_id", habit.id).eq("done_date", today);
      const newStreak = Math.max(0, habit.streak - 1);
      await supabase.from("habits").update({ streak: newStreak, last_done_date: null }).eq("id", habit.id);
    } else {
      await supabase.from("habit_logs").upsert({ habit_id: habit.id, done_date: today }, { onConflict: "habit_id,done_date" });
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      const wasDoneYesterday = habit.last_done_date === yesterdayStr;
      const newStreak = wasDoneYesterday ? habit.streak + 1 : 1;
      await supabase.from("habits").update({ streak: newStreak, last_done_date: today }).eq("id", habit.id);
    }
    router.refresh();
  }

  if (habits.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">
        Привычек пока нет. Добавьте в разделе «Привычки».
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {habits.map((habit) => {
        const done = doneIds.has(habit.id);
        return (
          <li
            key={habit.id}
            className="flex items-center gap-3 p-4 rounded-xl bg-dark-800 border border-dark-600 card-hover animate-slide-up"
          >
            <button
              type="button"
              onClick={() => toggleHabit(habit)}
              className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                done ? "bg-accent border-accent text-white" : "border-dark-500 hover:border-accent"
              }`}
              aria-label={habit.title}
            >
              {done ? "✓" : ""}
            </button>
            <span className="flex-1 text-white">{habit.title}</span>
            <span className="text-sm text-accent">🔥 {habit.streak}</span>
          </li>
        );
      })}
    </ul>
  );
}
