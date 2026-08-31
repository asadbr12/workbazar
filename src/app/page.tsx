import Image from "next/image";
import Link from "next/link";
import { SKILL_GROUPS } from "@/lib/validation";
import HomeHeroTagline from "@/components/HomeHeroTagline";
import FounderQuote from "@/components/FounderQuote";

const CATEGORY_STYLES: Record<string, { bg: string; icon: string }> = {
  "skilled-trades": { bg: "bg-blue-600", icon: "🛠️" },
  "home-facility-services": { bg: "bg-green-600", icon: "🏠" },
  professionals: { bg: "bg-violet-600", icon: "💼" },
  teacher: { bg: "bg-amber-500", icon: "🎓" },
};

const TRUST_POINTS = [
  "Verified Professionals",
  "On-time Service",
  "Affordable Pricing",
  "24/7 Support",
];

const STEPS = [
  {
    icon: "📝",
    title: "Post a Requirement",
    en: "Tell us what you need in a few steps.",
    hi: "कुछ आसान चरणों में अपनी ज़रूरत बताएं।",
  },
  {
    icon: "🤝",
    title: "Get Matched",
    en: "We connect you with verified professionals.",
    hi: "हम आपको सत्यापित पेशेवरों से जोड़ते हैं।",
  },
  {
    icon: "💬",
    title: "Discuss & Confirm",
    en: "Chat, negotiate & confirm the work.",
    hi: "बात करें और काम पक्का करें।",
  },
  {
    icon: "✅",
    title: "Work Done",
    en: "Job completed to your satisfaction.",
    hi: "आपकी संतुष्टि के साथ काम पूरा।",
  },
];

const FEATURES = [
  {
    icon: "🛡️",
    title: "Verified & Trusted",
    en: "All professionals are verified before listing.",
    hi: "सभी पेशेवर सत्यापित होकर ही सूचीबद्ध होते हैं।",
  },
  {
    icon: "⏱️",
    title: "Quick Booking",
    en: "Search, contact and book in just a few clicks.",
    hi: "कुछ ही क्लिक में खोजें, संपर्क करें और बुक करें।",
  },
  {
    icon: "📍",
    title: "Nearest Worker, Every Time",
    en: "We match you with the closest available worker.",
    hi: "हर बार आपके सबसे पास का वर्कर मिलेगा।",
  },
  {
    icon: "🎧",
    title: "24/7 Support",
    en: "Our support team is always here to help.",
    hi: "हमारी सहायता टीम हमेशा उपलब्ध है।",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="animate-fade-in-up">
          <span className="animate-badge-pulse inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white sm:text-sm">
            ✨ Kam Daam, Pakka Kaam — Low Price, Guaranteed Work
          </span>

          <div className="mt-4">
            <HomeHeroTagline />
          </div>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-600 sm:text-base">
            Find trusted, verified professionals near you for any home, office
            or personal work — fast, reliable &amp; affordable.
          </p>

          <form action="/search" method="get" className="mt-6 flex max-w-md gap-2">
            <input
              name="q"
              placeholder="Search a skill — e.g. Electrician  खोजें"
              className="input"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Search
            </button>
          </form>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-gray-600 sm:text-sm">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <span className="text-green-600">✓</span> {point}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="animate-fade-in-up relative mx-auto w-full max-w-[180px] lg:ml-auto lg:mr-0 lg:max-w-[210px]"
          style={{ animationDelay: "120ms" }}
        >
          <div className="absolute inset-0 -z-10 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="relative overflow-hidden rounded-2xl border-4 border-white shadow-xl">
            <Image
              src="/asad.pic.jpg"
              alt="Md Asad Siddiqui"
              width={480}
              height={560}
              className="h-[210px] w-full object-cover sm:h-[240px]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gray-900/80 px-4 py-3 backdrop-blur-sm">
              <p className="truncate text-sm font-bold text-white">Md Asad Siddiqui</p>
              <p className="truncate text-xs text-blue-200">Founder &amp; CEO</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <FounderQuote />
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/signup?role=WORKER"
          style={{ animationDelay: "80ms" }}
          className="card-hover animate-fade-in-up flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base text-white">
            🙋
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-gray-900">
              Looking for work? <span className="font-normal text-gray-500">क्या आपको काम चाहिए?</span>
            </h3>
            <p className="truncate text-xs text-gray-500">
              Register as a worker — nearby recruiters will find you.
            </p>
          </div>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm text-blue-600 shadow-sm">
            →
          </span>
        </Link>

        <Link
          href="/signup?role=RECRUITER"
          style={{ animationDelay: "160ms" }}
          className="card-hover animate-fade-in-up flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-base text-white">
            🔍
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-gray-900">
              Need a worker? <span className="font-normal text-gray-500">मुझे वर्कर चाहिए?</span>
            </h3>
            <p className="truncate text-xs text-gray-500">
              Register — a skilled worker will be ready to contact.
            </p>
          </div>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm text-green-600 shadow-sm">
            →
          </span>
        </Link>
      </section>

      <section id="skills" className="mt-10 scroll-mt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Explore <span className="text-blue-600">Top</span> Categories
          </h2>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">Find the perfect professional for every need</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SKILL_GROUPS.map((group, i) => {
            const style = CATEGORY_STYLES[group.slug] ?? { bg: "bg-gray-600", icon: "🔧" };
            return (
              <div
                key={group.slug}
                style={{ animationDelay: `${220 + i * 60}ms` }}
                className="card-hover animate-fade-in-up rounded-xl border border-gray-200 bg-gray-50 p-4 text-center"
              >
                <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full text-lg text-white ${style.bg}`}>
                  {style.icon}
                </div>
                <Link href={`/skills/${group.slug}`} className="mt-3 block rounded-lg transition hover:text-blue-700">
                  <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
                  <p className="truncate text-xs text-gray-500">
                    {group.nameHindi} · {group.skills.length} skills
                  </p>
                </Link>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {group.skills.slice(0, 4).map((skill) => (
                    <Link
                      key={skill}
                      href={`/workers/${encodeURIComponent(skill)}`}
                      className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {skill}
                    </Link>
                  ))}
                  {group.skills.length > 4 && (
                    <Link
                      href={`/skills/${group.slug}`}
                      className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      +{group.skills.length - 4} more
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-center text-xl font-bold text-gray-900 sm:text-2xl">How It Works</h2>

        <div className="relative mt-6">
          <div className="absolute left-[12.5%] right-[12.5%] top-6 hidden border-t-2 border-dashed border-gray-300 sm:block" />
          <div className="relative grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-4">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                style={{ animationDelay: `${i * 80}ms` }}
                className="animate-fade-in-up flex flex-col items-center text-center"
              >
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-lg">
                    {step.icon}
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-2 text-xs font-bold text-gray-900 sm:text-sm">{step.title}</h3>
                <p className="mt-0.5 max-w-[11rem] truncate text-[11px] text-gray-500">{step.en}</p>
                <p className="max-w-[11rem] truncate text-[11px] text-gray-400">{step.hi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Why Choose <span className="text-blue-600">ALWork Bazar</span>
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base text-blue-600">
                {f.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-gray-900 sm:text-sm">{f.title}</h3>
                <p className="truncate text-xs text-gray-500">{f.en}</p>
                <p className="truncate text-xs text-gray-400">{f.hi}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
