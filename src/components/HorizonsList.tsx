"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Horizon } from "@/lib/types";
import HorizonCard from "./HorizonCard";

export default function HorizonsList({ horizons: initial }: { horizons: Horizon[] }) {
  const router = useRouter();
  const [horizons, setHorizons] = useState(initial);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function addHorizon(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("horizons")
      .insert({ user_id: user.id, title: newTitle.trim(), sort_order: horizons.length })
      .select()
      .single();
    if (data) setHorizons((h) => [...h, data]);
    setNewTitle("");
    setLoading(false);
    router.refresh();
  }

  async function deleteHorizon(id: string) {
    await supabase.from("horizons").delete().eq("id", id);
    setHorizons((h) => h.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addHorizon} className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Новый горизонт (направление жизни)"
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

      <ul className="space-y-4">
        {horizons.map((h) => (
          <HorizonCard key={h.id} horizon={h} onDelete={() => deleteHorizon(h.id)} />
        ))}
      </ul>

      {horizons.length === 0 && (
        <p className="text-gray-500 text-sm py-8 text-center">
          Добавьте первый горизонт — например «Здоровье», «Карьера», «Семья».
        </p>
      )}
    </div>
  );
}
