import { createClient } from "@/lib/supabase/server";
import HabitsList from "@/components/HabitsList";

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Привычки</h1>
        <p className="text-gray-400 text-sm mt-1">Отмечайте каждый день — считаем streak 🔥</p>
      </header>
      <HabitsList habits={habits ?? []} />
    </div>
  );
}
