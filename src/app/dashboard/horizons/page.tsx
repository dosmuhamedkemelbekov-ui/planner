import { createClient } from "@/lib/supabase/server";
import HorizonsList from "@/components/HorizonsList";

export default async function HorizonsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: horizons } = await supabase
    .from("horizons")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Горизонты</h1>
      </header>
      <HorizonsList horizons={horizons ?? []} />
    </div>
  );
}
