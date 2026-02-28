"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: "ok", text: "Проверьте почту — отправлена ссылка для подтверждения." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Ошибка входа или регистрации",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-500 text-white placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition"
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-500 text-white placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition"
      />
      {message && (
        <p
          className={`text-sm ${
            message.type === "ok" ? "text-accent" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium transition disabled:opacity-50"
      >
        {loading ? "..." : isSignUp ? "Зарегистрироваться" : "Войти"}
      </button>
      <button
        type="button"
        onClick={() => setIsSignUp((v) => !v)}
        className="w-full text-sm text-gray-400 hover:text-accent transition"
      >
        {isSignUp ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
      </button>
    </form>
  );
}
