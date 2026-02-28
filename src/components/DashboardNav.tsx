"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/dashboard", label: "Сегодня" },
  { href: "/dashboard/horizons", label: "Горизонты" },
  { href: "/dashboard/habits", label: "Привычки" },
];

export default function DashboardNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <aside className="w-56 bg-dark-800 border-r border-dark-600 flex flex-col">
      <div className="p-4 border-b border-dark-600">
        <p className="text-xs text-gray-500 truncate" title={userEmail}>
          {userEmail}
        </p>
        <p className="text-sm text-gray-400">Личный кабинет</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              pathname === href
                ? "bg-accent/20 text-accent"
                : "text-gray-400 hover:bg-dark-600 hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-dark-600">
        <button
          onClick={signOut}
          className="w-full px-3 py-2 text-left text-sm text-gray-400 hover:text-white rounded-lg hover:bg-dark-600 transition"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}
