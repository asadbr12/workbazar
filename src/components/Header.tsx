"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Me = {
  id: string;
  phone: string;
  role: "WORKER" | "RECRUITER" | null;
  fullName: string | null;
  photoUrl: string | null;
  hasProfile: boolean;
  hasActiveSubscription: boolean;
} | null;

export default function Header() {
  const [me, setMe] = useState<Me>(null);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setMe(data.user))
      .finally(() => setLoaded(true));
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const isWorker = me?.role === "WORKER";
  const dashboardHref = isWorker ? "/dashboard/worker" : "/dashboard/recruiter";
  const editHref = isWorker ? "/dashboard/worker/edit" : "/dashboard/recruiter/edit";
  const settingsHref = isWorker ? "/dashboard/worker/settings" : "/dashboard/recruiter/settings";
  const displayName = me?.fullName?.split(" ")[0] || "Account";

  return (
    <header className="relative z-50 h-16 shrink-0 border-b border-black/10 bg-white">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 transition-transform hover:scale-[1.02]"
        >
          <Image src="/logo.svg" alt="" width={32} height={32} className="h-8 w-8" />
          ALWork<span className="text-blue-600">Bazar</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <Link href="/" className="hidden transition-colors hover:text-blue-600 sm:inline">
            Home
          </Link>

          {loaded && me ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-3 transition-colors hover:border-blue-300"
              >
                {me.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={me.photoUrl}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden sm:inline">{displayName}</span>
                <svg
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {menuOpen && (
                <div className="animate-dropdown-in absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {me.fullName ?? "Your account"}
                    </p>
                    <p className="text-xs text-gray-500">
                      +91 {me.phone} &middot; {isWorker ? "Worker" : "Recruiter"}
                    </p>
                  </div>
                  <div className="py-1 text-sm text-gray-700">
                    <MenuLink href={dashboardHref} label="Dashboard" icon="📊" />
                    <MenuLink href={editHref} label="Edit profile" icon="🛠️" />
                    <MenuLink href={settingsHref} label="Account settings" icon="⚙️" />
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <span aria-hidden>🚪</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="transition-colors hover:text-blue-600">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 hover:shadow-md"
              >
                Signup
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function MenuLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-4 py-2 transition-colors hover:bg-gray-50">
      <span aria-hidden>{icon}</span> {label}
    </Link>
  );
}
