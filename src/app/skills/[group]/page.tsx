import Link from "next/link";
import { notFound } from "next/navigation";
import { SKILL_GROUPS } from "@/lib/validation";

export default async function SkillGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group: groupSlug } = await params;
  const group = SKILL_GROUPS.find((g) => g.slug === groupSlug);

  if (!group) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/#skills" className="text-sm font-medium text-blue-600 hover:text-blue-700">
        ← Back to all categories
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        {group.name}
        <span className="ml-2 text-base font-normal text-gray-500">
          {group.nameHindi}
        </span>
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Pick a skill to see registered workers.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {group.skills.map((skill) => (
          <Link
            key={skill}
            href={`/workers/${encodeURIComponent(skill)}`}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          >
            {skill}
          </Link>
        ))}
      </div>
    </div>
  );
}
