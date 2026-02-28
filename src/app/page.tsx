import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/AuthForm";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-dark-900">
      <div className="w-full max-w-md animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          Планировщик жизни
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Горизонты · Проекты · Задачи · Привычки
        </p>
        <AuthForm />
        <p className="text-center text-gray-500 text-xs mt-6">
          Вход и регистрация через email. Supabase Auth.
        </p>
      </div>
    </main>
  );
}
