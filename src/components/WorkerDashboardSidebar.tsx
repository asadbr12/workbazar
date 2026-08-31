"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const WORK_ITEMS = [
  { href: "/dashboard/worker", label: "Dashboard", icon: "🏠", exact: true },
  { href: "/dashboard/worker/bookings", label: "Booking Requests", icon: "📋", exact: false },
  { href: "/dashboard/worker/jobs", label: "My Jobs", icon: "💼", exact: false },
  { href: "/dashboard/worker/reviews", label: "Reviews", icon: "⭐", exact: false },
] as const;

const PROFILE_ITEMS = [
  { href: "/dashboard/worker/edit", label: "My Profile", icon: "👤", exact: false },
  { href: "/dashboard/worker/settings", label: "Settings", icon: "⚙️", exact: false },
] as const;

export default function WorkerDashboardSidebar({
  bookingRequestCount,
}: {
  bookingRequestCount: number;
}) {
  const pathname = usePathname();

  const badges: Record<string, number> = {
    "/dashboard/worker/bookings": bookingRequestCount,
  };

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Mobile: horizontal scroll tabs */}
      <nav className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
        {[...WORK_ITEMS, ...PROFILE_ITEMS].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              isActive(item.href, item.exact)
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span aria-hidden>{item.icon}</span> {item.label}
            {badges[item.href] > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {badges[item.href]}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Desktop: vertical sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-6 space-y-6">
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Work
            </p>
            <nav className="mt-1 space-y-0.5">
              {WORK_ITEMS.map((item) => (
                <SidebarLink
                  key={item.href}
                  {...item}
                  active={isActive(item.href, item.exact)}
                  badge={badges[item.href]}
                />
              ))}
            </nav>
          </div>
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Profile
            </p>
            <nav className="mt-1 space-y-0.5">
              {PROFILE_ITEMS.map((item) => (
                <SidebarLink key={item.href} {...item} active={isActive(item.href)} />
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span aria-hidden>{icon}</span> {label}
      </span>
      {Boolean(badge) && (
        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
