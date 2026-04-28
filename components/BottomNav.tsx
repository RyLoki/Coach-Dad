"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Dumbbell, FileText } from "lucide-react";

const items = [
  { href: "/", label: "Today", icon: Home },
  { href: "/plans", label: "Plans", icon: ClipboardList },
  { href: "/drills", label: "Drills", icon: Dumbbell },
  { href: "/sources", label: "Sources", icon: FileText },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2 px-4 min-h-[44px] min-w-[44px] ${
                active ? "text-blue-600" : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
