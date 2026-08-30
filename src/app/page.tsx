import Image from "next/image";
import Link from "next/link";
import { SKILL_GROUPS } from "@/lib/validation";
import HomeHeroTagline from "@/components/HomeHeroTagline";
import FounderQuote from "@/components/FounderQuote";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-col gap-[1.6vh] overflow-hidden bg-gradient-to-b from-blue-50 to-gray-50 px-[max(1rem,2vw)] py-[1.6vh] sm:h-[calc(100dvh-4rem)] sm:min-h-0">
      <section className="grid shrink-0 grid-cols-1 gap-[1.6vh] lg:grid-cols-[auto_minmax(0,560px)_auto] lg:items-start">
        <div className="animate-fade-in-up flex w-[clamp(130px,19vh,196px)] flex-col items-center gap-[0.8vh]">
          <Image
            src="/asad.pic.jpg"
            alt="Md Asad Siddiqui"
            width={352}
            height={352}
            className="h-[clamp(130px,19vh,196px)] w-[clamp(130px,19vh,196px)] shrink-0 rounded-full border-4 border-white object-cover shadow-lg"
          />
          <p className="text-center text-[clamp(0.75rem,1.6vh,0.95rem)] leading-tight text-gray-500">
            <span className="font-bold text-gray-900">Md Asad Siddiqui</span>
            <br />
            Founder &amp; CEO
          </p>
          <FounderQuote />
        </div>

        <div>
          <span className="animate-badge-pulse inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-600 px-[1.1vh] py-[0.4vh] text-[clamp(0.68rem,1.4vh,0.85rem)] font-bold text-white">
            ✨ Kam Daam, Pakka Kaam — Low Price, Guaranteed Work
          </span>

          <div className="mt-[1vh]">
            <HomeHeroTagline />
          </div>

          <form action="/search" method="get" className="mt-[3.2vh] flex max-w-md gap-2">
            <input
              name="q"
              placeholder="Search a skill — e.g. Electrician  खोजें"
              className="input text-[clamp(0.7rem,1.5vh,0.95rem)]"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-gray-900 px-[clamp(0.7rem,1.8vh,1.1rem)] py-[clamp(0.4rem,1.1vh,0.65rem)] text-[clamp(0.7rem,1.5vh,0.95rem)] font-semibold text-white transition hover:bg-gray-800"
            >
              Search
            </button>
          </form>
        </div>

        <div className="animate-fade-in-up hidden w-[clamp(160px,18vh,208px)] flex-col gap-[1vh] lg:flex" style={{ animationDelay: "120ms" }}>
          <div className="card-hover rounded-xl border border-gray-200 bg-white p-[1.2vh]">
            <p className="text-[clamp(1rem,2.1vh,1.3rem)]">⚡</p>
            <p className="mt-[0.3vh] text-[clamp(0.72rem,1.5vh,0.88rem)] font-bold text-gray-900">
              Response in minutes
            </p>
            <p className="text-[clamp(0.66rem,1.35vh,0.8rem)] text-gray-500">मिनटों में जवाब</p>
          </div>
          <div className="card-hover rounded-xl border border-gray-200 bg-white p-[1.2vh]">
            <p className="text-[clamp(1rem,2.1vh,1.3rem)]">📍</p>
            <p className="mt-[0.3vh] text-[clamp(0.72rem,1.5vh,0.88rem)] font-bold text-gray-900">
              Nearest worker, every time
            </p>
            <p className="text-[clamp(0.66rem,1.35vh,0.8rem)] text-gray-500">हर बार नज़दीकी वर्कर</p>
          </div>
          <div className="card-hover rounded-xl border border-gray-200 bg-white p-[1.2vh]">
            <p className="text-[clamp(1rem,2.1vh,1.3rem)]">💰</p>
            <p className="mt-[0.3vh] text-[clamp(0.72rem,1.5vh,0.88rem)] font-bold text-gray-900">
              ₹99/month for workers
            </p>
            <p className="text-[clamp(0.66rem,1.35vh,0.8rem)] text-gray-500">रिक्रूटर के लिए फ्री</p>
          </div>
        </div>
      </section>

      <section className="grid shrink-0 grid-cols-1 gap-[1.2vh] sm:grid-cols-2">
        <Link
          href="/signup?role=WORKER"
          style={{ animationDelay: "80ms" }}
          className="card-hover animate-fade-in-up flex items-center gap-[1.2vh] rounded-xl border border-gray-200 bg-white px-[1.6vh] py-[1.2vh] shadow-sm"
        >
          <div className="flex h-[clamp(2rem,4.4vh,2.6rem)] w-[clamp(2rem,4.4vh,2.6rem)] shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[clamp(1rem,2.2vh,1.3rem)] text-blue-600">
            🛠️
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[clamp(0.9rem,1.9vh,1.1rem)] font-bold leading-tight text-gray-900">
              Looking for work? <span className="font-normal text-gray-500">क्या आपको काम चाहिए?</span>
            </h3>
            <p className="truncate text-[clamp(0.68rem,1.4vh,0.82rem)] leading-snug text-gray-500">
              Register as a worker — nearby recruiters will find you.
            </p>
          </div>
          <span className="shrink-0 text-[clamp(0.78rem,1.7vh,1rem)] font-bold text-blue-600">→</span>
        </Link>

        <Link
          href="/signup?role=RECRUITER"
          style={{ animationDelay: "160ms" }}
          className="card-hover animate-fade-in-up flex items-center gap-[1.2vh] rounded-xl border border-gray-200 bg-white px-[1.6vh] py-[1.2vh] shadow-sm"
        >
          <div className="flex h-[clamp(2rem,4.4vh,2.6rem)] w-[clamp(2rem,4.4vh,2.6rem)] shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[clamp(1rem,2.2vh,1.3rem)] text-blue-600">
            🔍
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[clamp(0.9rem,1.9vh,1.1rem)] font-bold leading-tight text-gray-900">
              Need a worker? <span className="font-normal text-gray-500">मुझे वर्कर चाहिए?</span>
            </h3>
            <p className="truncate text-[clamp(0.68rem,1.4vh,0.82rem)] leading-snug text-gray-500">
              Register — a skilled worker will be ready to contact.
            </p>
          </div>
          <span className="shrink-0 text-[clamp(0.78rem,1.7vh,1rem)] font-bold text-blue-600">→</span>
        </Link>
      </section>

      <section
        id="skills"
        className="flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white p-[1.6vh]"
      >
        <div className="flex flex-1 items-start justify-center overflow-hidden pt-[1vh]">
          <div className="grid w-full grid-cols-2 gap-[2vh] lg:grid-cols-4">
            {SKILL_GROUPS.map((group, i) => (
              <div
                key={group.slug}
                style={{ animationDelay: `${220 + i * 60}ms` }}
                className="card-hover animate-fade-in-up rounded-xl border border-gray-200 bg-gray-50 p-[2.2vh]"
              >
                <Link
                  href={`/skills/${group.slug}`}
                  className="block rounded-lg transition hover:text-blue-700"
                >
                  <h3 className="truncate text-[clamp(1.1rem,2.9vh,1.55rem)] font-bold text-gray-900">
                    {group.name}
                  </h3>
                  <p className="truncate text-[clamp(0.8rem,1.8vh,1.1rem)] text-gray-500">
                    {group.nameHindi} · {group.skills.length} skills
                  </p>
                </Link>
                <div className="mt-[1.4vh] flex flex-wrap gap-[0.9vh]">
                  {group.skills.slice(0, 4).map((skill) => (
                    <Link
                      key={skill}
                      href={`/workers/${encodeURIComponent(skill)}`}
                      className="rounded-full border border-gray-200 bg-white px-[1.2vh] py-[0.5vh] text-[clamp(0.8rem,1.9vh,1.1rem)] font-medium text-gray-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {skill}
                    </Link>
                  ))}
                  {group.skills.length > 4 && (
                    <Link
                      href={`/skills/${group.slug}`}
                      className="rounded-full border border-blue-200 bg-blue-50 px-[1.2vh] py-[0.5vh] text-[clamp(0.8rem,1.9vh,1.1rem)] font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      +{group.skills.length - 4} more
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
