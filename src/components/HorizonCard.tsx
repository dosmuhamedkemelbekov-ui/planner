"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Horizon, Project, Task } from "@/lib/types";

const ENERGY = { high: "🟢", medium: "🟡", low: "🔴" } as const;

export default function HorizonCard({ horizon, onDelete }: { horizon: Horizon; onDelete: () => void }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskEnergy, setTaskEnergy] = useState<"high" | "medium" | "low">("medium");
  const [taskDue, setTaskDue] = useState("");
  const [aiGoal, setAiGoal] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const supabase = createClient();

  async function loadDetails() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setLoading(true);
    const [{ data: proj }, { data: t }] = await Promise.all([
      supabase.from("projects").select("*").eq("horizon_id", horizon.id).order("created_at"),
      supabase.from("tasks").select("*").eq("horizon_id", horizon.id).is("completed_at", null).order("due_date"),
    ]);
    setProjects(proj ?? []);
    setTasks(t ?? []);
    setExpanded(true);
    setLoading(false);
    router.refresh();
  }

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    const { data } = await supabase
      .from("projects")
      .insert({ horizon_id: horizon.id, title: newProjectTitle.trim() })
      .select()
      .single();
    if (data) setProjects((p) => [...p, data]);
    setNewProjectTitle("");
    router.refresh();
  }

  async function deleteProject(id: string) {
    await supabase.from("projects").delete().eq("id", id);
    setProjects((p) => p.filter((x) => x.id !== id));
    router.refresh();
  }

  async function updateProgress(project: Project, progress: number) {
    await supabase.from("projects").update({ progress }).eq("id", project.id);
    setProjects((p) => p.map((x) => (x.id === project.id ? { ...x, progress } : x)));
    router.refresh();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        horizon_id: horizon.id,
        title: newTaskTitle.trim(),
        energy_level: taskEnergy,
        due_date: taskDue || null,
      })
      .select()
      .single();
    if (data) setTasks((t) => [...t, data]);
    setNewTaskTitle("");
    setTaskDue("");
    router.refresh();
  }

  async function completeTask(task: Task) {
    await supabase.from("tasks").update({ completed_at: new Date().toISOString() }).eq("id", task.id);
    setTasks((t) => t.filter((x) => x.id !== task.id));
    router.refresh();
  }

  async function breakGoalIntoTasks() {
    if (!aiGoal.trim()) return;
    setAiError("");
    setAiLoading(true);
    try {
      const res = await fetch("/api/break-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: aiGoal.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      const { tasks: suggested } = data as { tasks: string[] };
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      for (const title of suggested) {
        await supabase.from("tasks").insert({
          user_id: user.id,
          horizon_id: horizon.id,
          title,
          energy_level: "medium",
        });
      }
      const { data: t } = await supabase.from("tasks").select("*").eq("horizon_id", horizon.id).is("completed_at", null).order("due_date");
      setTasks(t ?? []);
      setAiGoal("");
      router.refresh();
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-dark-800 border border-dark-600 overflow-hidden card-hover animate-slide-up">
      <button
        type="button"
        onClick={loadDetails}
        disabled={loading}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-semibold text-white pl-3 border-l-4" style={{ borderColor: horizon.color }}>
          {horizon.title}
        </span>
        <span className="text-gray-500 text-sm">
          {expanded ? "Свернуть" : "Открыть"}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-dark-600 pt-4">
          {/* Проекты */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Проекты</h3>
            <form onSubmit={addProject} className="flex gap-2 mb-3">
              <input
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Новый проект"
                className="flex-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-500 text-white text-sm placeholder-gray-500 focus:border-accent outline-none"
              />
              <button type="submit" className="px-3 py-2 rounded-lg bg-accent/80 text-white text-sm">
                +
              </button>
            </form>
            <ul className="space-y-2">
              {projects.map((proj) => (
                <li key={proj.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-700">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{proj.title}</p>
                    <div className="progress-bar mt-1">
                      <div className="progress-bar-fill" style={{ width: `${proj.progress}%` }} />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={proj.progress}
                    onChange={(e) => updateProgress(proj, +e.target.value)}
                    className="w-20 h-2 accent-accent"
                  />
                  <button
                    type="button"
                    onClick={() => deleteProject(proj.id)}
                    className="text-gray-500 hover:text-red-400 text-sm"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ИИ: разбить цель на задачи */}
          <div className="p-3 rounded-lg bg-dark-700/50 border border-dark-600">
            <h3 className="text-sm font-medium text-accent mb-2">✨ Разбить цель на задачи (ИИ)</h3>
            <div className="flex gap-2">
              <input
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                placeholder="Например: выучить английский за полгода"
                className="flex-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-500 text-white text-sm placeholder-gray-500 focus:border-accent outline-none"
              />
              <button
                type="button"
                onClick={breakGoalIntoTasks}
                disabled={aiLoading || !aiGoal.trim()}
                className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-50"
              >
                {aiLoading ? "..." : "Разбить"}
              </button>
            </div>
            {aiError && <p className="text-red-400 text-xs mt-1">{aiError}</p>}
          </div>

          {/* Задачи */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Задачи</h3>
            <form onSubmit={addTask} className="space-y-2 mb-3">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Новая задача"
                className="w-full px-3 py-2 rounded-lg bg-dark-700 border border-dark-500 text-white text-sm placeholder-gray-500 focus:border-accent outline-none"
              />
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-gray-500 text-xs">Энергия:</span>
                {(["high", "medium", "low"] as const).map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setTaskEnergy(e)}
                    className={`px-2 py-1 rounded text-xs ${taskEnergy === e ? "bg-accent text-white" : "bg-dark-600 text-gray-400"}`}
                  >
                    {ENERGY[e]}
                  </button>
                ))}
                <input
                  type="date"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  className="px-2 py-1 rounded bg-dark-600 text-gray-300 text-xs"
                />
                <button type="submit" className="px-3 py-1 rounded-lg bg-accent/80 text-white text-sm">
                  Добавить задачу
                </button>
              </div>
            </form>
            <ul className="space-y-1">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 py-2 text-sm">
                  <button
                    type="button"
                    onClick={() => completeTask(t)}
                    className="w-5 h-5 rounded border border-dark-500 hover:border-accent flex-shrink-0"
                  />
                  {t.energy_level && <span>{ENERGY[t.energy_level]}</span>}
                  <span className="text-white truncate flex-1">{t.title}</span>
                  {t.due_date && <span className="text-gray-500 text-xs">{t.due_date}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onDelete}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Удалить горизонт
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
