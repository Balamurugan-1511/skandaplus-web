export const openPositions = [
  {
    title: 'Senior AI Instructor',
    type: 'Full-time',
    location: 'Pune',
    locationValue: 'pune',
    workMode: 'Hybrid',
    workModeValue: 'hybrid',
    experienceLevel: 'senior',
    experienceLabel: '5+ years',
    dept: 'Education',
    desc: "Lead our advanced AI and ML courses. You'll design curriculum, deliver live sessions, and mentor students through their AI journey.",
    requirements: [
      '5+ years in AI/ML engineering',
      'Experience in teaching or training',
      'Strong Python and ML framework skills',
      'Excellent communication skills',
    ],
  },
  {
    title: 'Curriculum Developer – Generative AI',
    type: 'Full-time',
    location: 'Pune',
    locationValue: 'pune',
    workMode: 'Hybrid',
    workModeValue: 'hybrid',
    experienceLevel: 'mid',
    experienceLabel: '3–5 years',
    dept: 'Education',
    desc: 'Design and develop cutting-edge GenAI course content including hands-on labs, projects, and assessments.',
    requirements: [
      '3+ years working with LLMs and GenAI',
      'Experience with LangChain, RAG, and fine-tuning',
      'Strong technical writing skills',
      'Passion for education',
    ],
  },
  {
    title: 'Career Placement Specialist',
    type: 'Full-time',
    location: 'Pune',
    locationValue: 'pune',
    workMode: 'On-site',
    workModeValue: 'onsite',
    experienceLevel: 'mid',
    experienceLabel: '3–5 years',
    dept: 'Career Services',
    desc: 'Help our graduates land their dream AI jobs. Build relationships with hiring partners and provide career coaching.',
    requirements: [
      '3+ years in tech recruitment or HR',
      "Strong network in Pune's tech ecosystem",
      'Excellent interpersonal skills',
      'Knowledge of AI industry',
    ],
  },
  {
    title: 'Corporate Training Manager',
    type: 'Full-time',
    location: 'Pune',
    locationValue: 'pune',
    workMode: 'On-site',
    workModeValue: 'onsite',
    experienceLevel: 'senior',
    experienceLabel: '5+ years',
    dept: 'Business Development',
    desc: 'Manage and grow our corporate training business. Work with enterprise clients to design customised AI training programs.',
    requirements: [
      '5+ years in B2B sales or account management',
      'Experience in L&D or training industry',
      'Strong presentation skills',
      'Understanding of AI/tech landscape',
    ],
  },
  {
    title: 'Teaching Assistant – AI Programs',
    type: 'Full-time',
    location: 'Pune',
    locationValue: 'pune',
    workMode: 'On-site',
    workModeValue: 'onsite',
    experienceLevel: 'fresher',
    experienceLabel: '0–1 year',
    dept: 'Education',
    desc: 'Support instructors during live sessions, help students with lab exercises, and grade assignments for our AI and ML courses.',
    requirements: [
      '0–1 year experience (freshers welcome)',
      'Solid grasp of Python fundamentals',
      'Genuine interest in AI/ML',
      'Good communication skills',
    ],
  },
  {
    title: 'AI Content & Community Writer',
    type: 'Full-time',
    location: 'Pune',
    locationValue: 'pune',
    workMode: 'Remote',
    workModeValue: 'remote',
    experienceLevel: 'junior',
    experienceLabel: '1–3 years',
    dept: 'Marketing',
    desc: 'Create blog posts, tutorials, and social content that help our community understand AI concepts and showcase student success stories.',
    requirements: [
      '1–3 years in content or technical writing',
      'Comfortable explaining technical topics simply',
      'Familiarity with AI/ML terminology',
      'Strong portfolio of published work',
    ],
  },
];

export function slugify(title) {
  return title
    ?.toLowerCase()
    ?.replace(/[–—]/g, '-')
    ?.replace(/[^a-z0-9]+/g, '-')
    ?.replace(/^-+|-+$/g, '');
}

export function getJobBySlug(slug) {
  return openPositions?.find((job) => slugify(job?.title) === slug) || null;
}
