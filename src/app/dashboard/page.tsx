import { createClient } from "@/lib/supabase/server";
import { format, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import TodayTasks from "@/components/TodayTasks";
import MorningRitual from "@/components/MorningRitual";
import TodayHabits from "@/components/TodayHabits";

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = format(new Date(), "yyyy-MM-dd");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .or(`scheduled_date.eq.${today},due_date.eq.${today}`)
    .is("completed_at", null)
    .order("due_date", { ascending: true });

  const { data: ritual } = await supabase
    .from("morning_ritual")
    .select("*")
    .eq("user_id", user.id)
    .eq("ritual_date", today)
    .single();

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const { data: habitLogs } = await supabase
    .from("habit_logs")
    .select("habit_id")
    .eq("done_date", today);

  const doneHabitIds = new Set((habitLogs ?? []).map((l) => l.habit_id));

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-white">Сегодня</h1>
        <p className="text-gray-400 text-sm mt-1">
          {format(new Date(), "EEEE, d MMMM", { locale: ru })}
        </p>
      </header>

      <MorningRitual initialRitual={ritual} today={today} />

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Задачи дня</h2>
        <TodayTasks tasks={tasks ?? []} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Привычки</h2>
        <TodayHabits habits={habits ?? []} doneIds={doneHabitIds} today={today} />
      </section>
    </div>
  );
}
