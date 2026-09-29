import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/openPositions';
import ApplyForm from './ApplyForm';

// Jobs are managed in the DB (via Admin), so this route is rendered per-request
// rather than statically generated from a fixed list — new jobs added through
// Admin need a working apply page immediately, without a rebuild.
export const dynamic = 'force-dynamic';

const experienceLabels = {
  fresher: '0–1 year',
  junior: '1–3 years',
  mid: '3–5 years',
  senior: '5+ years',
};

async function getJobBySlug(slug) {
  const jobs = await prisma.job.findMany({ where: { is_active: true } });
  const job = jobs?.find((j) => slugify(j?.title) === slug);
  if (!job) return null;

  return {
    title: job.title,
    dept: job.department,
    location: job.location,
    workMode: job.work_mode,
    type: job.employment_type,
    experienceLabel: experienceLabels[job.experience_level] || job.experience_level,
    requirements: job.requirements || [],
  };
}

export async function generateMetadata({ params }) {
  const job = await getJobBySlug(params?.job);
  if (!job) return { title: 'Apply | AI Plus Careers' };
  return { title: `Apply – ${job?.title} | AI Plus Careers` };
}

export default async function JobApplicationPage({ params }) {
  const job = await getJobBySlug(params?.job);
  return <ApplyForm job={job} />;
}
