import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-slate-950 text-gray-300">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
              <Image src="/logo.svg" alt="" width={28} height={28} className="h-7 w-7" />
              ALWork<span className="text-blue-400">Bazar</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm text-gray-400">
              Trusted professionals, near you. Any work, done right.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-white">Home</Link>
              </li>
              <li>
                <Link href="/search" className="transition-colors hover:text-white">Search Workers</Link>
              </li>
              <li>
                <Link href="/#skills" className="transition-colors hover:text-white">Services</Link>
              </li>
              <li>
                <Link href="/signup?role=WORKER" className="transition-colors hover:text-white">Become a Worker</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Get Started</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/signup?role=RECRUITER" className="transition-colors hover:text-white">Post a Requirement</Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-white">Login</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ALWork Bazar. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
