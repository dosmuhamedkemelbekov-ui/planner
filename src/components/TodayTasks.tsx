"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";

const ENERGY = { high: "🟢", medium: "🟡", low: "🔴" } as const;

export default function TodayTasks({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const supabase = createClient();

  async function toggleComplete(task: Task) {
    await supabase
      .from("tasks")
      .update({
        completed_at: task.completed_at ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id);
    router.refresh();
  }

  if (tasks.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">
        На сегодня задач нет. Добавьте в разделе «Горизонты» или запланируйте дату.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center gap-3 p-4 rounded-xl bg-dark-800 border border-dark-600 card-hover animate-slide-up"
        >
          <button
            type="button"
            onClick={() => toggleComplete(task)}
            className="w-6 h-6 rounded-full border-2 border-dark-500 hover:border-accent flex-shrink-0 flex items-center justify-center text-accent"
            aria-label="Отметить выполненным"
          >
            {task.completed_at ? "✓" : ""}
          </button>
          <span className="flex-1 text-white">
            {task.energy_level && (
              <span className="mr-2" title={task.energy_level}>
                {ENERGY[task.energy_level]}
              </span>
            )}
            {task.title}
          </span>
          {task.due_date && (
            <span className="text-xs text-gray-500">{task.due_date}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
