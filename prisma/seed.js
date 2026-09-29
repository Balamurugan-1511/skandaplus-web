// Seeds courses, jobs, and blogs from the app's static content so the
// database tables have real rows to reference and display.
// Run with: npm run seed
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { openPositions } from '../src/lib/openPositions.js';
import { blogPosts } from '../src/lib/blogPosts.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const courses = [
  { slug: 'ai-fundamentals', title: 'AI Fundamentals & Python for AI', category: 'AI', description: 'Master the foundations of AI, machine learning concepts, and Python programming. Perfect for beginners.', href: '/ai-courses/ai-fundamentals', duration: '6 weeks', level: 'Beginner', price: 25000 },
  { slug: 'machine-learning', title: 'Machine Learning Engineering', category: 'AI', description: 'Build and deploy production-ready ML models using scikit-learn, TensorFlow, and cloud platforms.', href: '/ai-courses/machine-learning', duration: '10 weeks', level: 'Intermediate', price: 55000 },
  { slug: 'deep-learning', title: 'Deep Learning & Neural Networks', category: 'AI', description: 'Dive deep into CNNs, RNNs, transformers, and build cutting-edge deep learning applications.', href: '/ai-courses/deep-learning', duration: '10 weeks', level: 'Advanced', price: 65000 },
  { slug: 'generative-ai', title: 'Generative AI & Large Language Models', category: 'AI', description: 'Master GPT, LLaMA, prompt engineering, RAG pipelines, and build production GenAI applications.', href: '/ai-courses/generative-ai', duration: '8 weeks', level: 'Intermediate', price: 55000 },
  { slug: 'ai-for-business', title: 'AI for Business Leaders', category: 'Business', description: 'Understand AI strategy, ROI, ethics, and how to lead AI transformation in your organisation.', href: '/ai-courses/ai-for-business', duration: '4 weeks', level: 'Beginner', price: 45000 },
  { slug: 'nlp', title: 'NLP & Conversational AI', category: 'AI', description: 'Build intelligent chatbots, voice assistants, and NLP pipelines using state-of-the-art models.', href: '/ai-courses/nlp', duration: '8 weeks', level: 'Intermediate', price: 55000 },
];

// Content that used to live only inside the 6 hand-built static pages
// (/ai-courses/ai-fundamentals, /machine-learning, etc.) — extracted here so
// it now lives in the database instead, since those static files have been
// removed and every course (including these 6) renders through the single
// dynamic /ai-courses/[slug] template.
const staticCourseContent = [
  {
    slug: "ai-fundamentals",
    description: "Master the foundations of Artificial Intelligence and Python programming. This beginner-friendly course gives you the essential skills to start your AI career in Pune's booming tech industry.",
    cover_image_url: "https://img.rocket.new/generatedImages/rocket_gen_img_15afdb008-1772093387845.png",
    long_description: [
      "The AI Fundamentals & Python for AI course is designed for complete beginners who want to enter the exciting world of Artificial Intelligence. You'll learn the core concepts of AI and machine learning while building practical Python programming skills.",
      "By the end of this course, you'll have a solid understanding of how AI systems work, be able to write Python code for data analysis and basic ML models, and have a portfolio project to showcase to employers.",
      "This course is Flexible EMI available, making it accessible to all Indian professionals looking to upskill in AI."
    ],
    what_you_learn: [
      "Understand core AI and ML concepts",
      "Write Python code for AI applications",
      "Work with data using NumPy and Pandas",
      "Build and evaluate ML models",
      "Apply AI to real-world problems",
      "Use popular AI tools and frameworks",
      "Understand AI ethics and responsible use",
      "Build a portfolio AI project"
    ],
    curriculum: [
      { week: "Week 1-2", title: "Introduction to AI & Python Foundations", topics: ["What is Artificial Intelligence? History and evolution", "Types of AI: Narrow AI, General AI, and AGI", "Python programming fundamentals for AI", "NumPy, Pandas, and Matplotlib for data manipulation", "Setting up your AI development environment"] },
      { week: "Week 3-4", title: "Core Machine Learning Concepts", topics: ["Supervised vs unsupervised vs reinforcement learning", "Linear regression and classification algorithms", "Decision trees and random forests", "Model evaluation metrics and validation techniques", "Feature engineering and data preprocessing"] },
      { week: "Week 5", title: "AI Applications & Tools", topics: ["Computer vision fundamentals with OpenCV", "Natural language processing basics", "Introduction to neural networks", "AI APIs and pre-trained models", "Ethical AI and responsible development"] },
      { week: "Week 6", title: "Capstone Project & Career Prep", topics: ["End-to-end AI project development", "Portfolio building and GitHub setup", "AI career pathways in Pune", "Interview preparation and resume review", "Certification exam preparation"] }
    ],
    tools: [
      "Python 3.11",
      "Jupyter Notebook",
      "NumPy",
      "Pandas",
      "Matplotlib",
      "Scikit-learn",
      "OpenCV",
      "Hugging Face",
      "Google Colab",
      "VS Code"
    ],
    prerequisites: [
      "No prior programming experience required",
      "Basic computer literacy (using a laptop/PC)",
      "Curiosity and willingness to learn",
      "A laptop with internet connection"
    ],
    who_is_this_for: [
      "Fresh graduates looking to enter AI field",
      "Working professionals wanting to upskill",
      "Career changers transitioning to tech",
      "Business professionals curious about AI",
      "Anyone who wants to understand AI fundamentals"
    ],
  },
  {
    slug: "machine-learning",
    description: "Build, train, and deploy production-ready machine learning models. Master the full ML lifecycle from data engineering to cloud deployment using industry-standard tools.",
    cover_image_url: "https://img.rocket.new/generatedImages/rocket_gen_img_1dcfc864c-1772164169627.png",
    long_description: [
      "The Machine Learning Engineering course takes you from ML fundamentals to production deployment. You'll master the complete ML lifecycle: data preparation, model training, evaluation, and deploying models to cloud platforms used by Pune's top tech companies.",
      "This course emphasises practical, production-grade skills. You'll work with real datasets from Pune's financial, retail, and healthcare sectors, and learn MLOps practices used by industry leaders."
    ],
    what_you_learn: [
      "Master advanced ML algorithms and ensemble methods",
      "Build production ML pipelines with Scikit-learn",
      "Train deep learning models with TensorFlow & PyTorch",
      "Deploy models to AWS SageMaker and GCP",
      "Implement MLOps with MLflow and Docker",
      "Monitor and maintain models in production",
      "Interpret ML models with SHAP and LIME",
      "Optimise hyperparameters systematically"
    ],
    curriculum: [
      { week: "Week 1-2", title: "ML Foundations & Data Engineering", topics: ["Supervised learning algorithms: regression, classification", "Unsupervised learning: clustering, dimensionality reduction", "Data preprocessing, cleaning, and feature engineering", "Train/test splits, cross-validation, and bias-variance tradeoff", "Scikit-learn deep dive: pipelines and transformers"] },
      { week: "Week 3-4", title: "Advanced ML Algorithms & Ensemble Methods", topics: ["Gradient boosting: XGBoost, LightGBM, CatBoost", "Support Vector Machines and kernel methods", "Ensemble methods: bagging, boosting, stacking", "Hyperparameter tuning with Optuna and GridSearchCV", "Model interpretability with SHAP and LIME"] },
      { week: "Week 5-6", title: "Deep Learning with TensorFlow & PyTorch", topics: ["Neural network architecture and backpropagation", "TensorFlow 2.x and Keras for model building", "PyTorch fundamentals and custom training loops", "Transfer learning and fine-tuning pre-trained models", "GPU training and mixed precision"] },
      { week: "Week 7-8", title: "MLOps & Production Deployment", topics: ["ML experiment tracking with MLflow and Weights & Biases", "Model serving with FastAPI and Docker", "Cloud deployment on AWS SageMaker and GCP Vertex AI", "CI/CD pipelines for ML models", "Monitoring model drift and performance in production"] }
    ],
    tools: [
      "Python",
      "Scikit-learn",
      "TensorFlow",
      "PyTorch",
      "XGBoost",
      "MLflow",
      "Docker",
      "AWS SageMaker",
      "FastAPI",
      "Jupyter",
      "SHAP",
      "Optuna"
    ],
    prerequisites: [],
    who_is_this_for: [],
  },
  {
    slug: "deep-learning",
    description: "Master the full spectrum of deep learning \u2014 from CNNs and RNNs to Transformers and Diffusion Models. Build cutting-edge AI systems used by the world's leading technology companies.",
    cover_image_url: "https://img.rocket.new/generatedImages/rocket_gen_img_1d2ff8a91-1764660695242.png",
    long_description: [
      "The Deep Learning & Neural Networks course is our most comprehensive AI program. You'll master the mathematical foundations and practical implementation of all major deep learning architectures \u2014 from classic CNNs to state-of-the-art Transformers and Diffusion Models.",
      "You'll train models on real GPU hardware, work with large-scale datasets, and learn to deploy optimised models to production. This course prepares you for senior AI/ML engineer roles at Pune's top technology companies."
    ],
    what_you_learn: [
      "Build CNNs for computer vision tasks",
      "Implement RNNs, LSTMs for sequence modelling",
      "Master the Transformer architecture",
      "Fine-tune BERT, GPT, and vision transformers",
      "Build and train GANs and VAEs",
      "Understand diffusion models and stable diffusion",
      "Optimise models with quantisation and pruning",
      "Deploy models with TensorRT and ONNX"
    ],
    curriculum: [
      { week: "Week 1-2", title: "Neural Network Foundations", topics: ["Perceptrons, activation functions, and forward propagation", "Backpropagation and gradient descent variants", "Regularisation: dropout, batch normalisation, L1/L2", "Optimisers: Adam, RMSprop, SGD with momentum", "Building custom neural networks in PyTorch"] },
      { week: "Week 3-4", title: "Convolutional Neural Networks (CNNs)", topics: ["CNN architecture: convolutions, pooling, feature maps", "Image classification with ResNet, VGG, EfficientNet", "Object detection: YOLO, Faster R-CNN, SSD", "Image segmentation with U-Net", "Transfer learning and fine-tuning for computer vision"] },
      { week: "Week 5-6", title: "Recurrent Networks & Sequence Models", topics: ["RNNs, LSTMs, and GRUs for sequence data", "Time series forecasting with deep learning", "Attention mechanisms and self-attention", "The Transformer architecture from scratch", "BERT and GPT pre-training objectives"] },
      { week: "Week 7-8", title: "Generative Models & Advanced Topics", topics: ["Variational Autoencoders (VAEs)", "Generative Adversarial Networks (GANs)", "Diffusion models and stable diffusion", "Reinforcement learning fundamentals", "Deploying deep learning models at scale"] },
      { week: "Week 9-10", title: "Capstone Projects & Industry Applications", topics: ["End-to-end computer vision project", "NLP project with transformer models", "Model optimisation: quantisation and pruning", "Edge AI deployment with TensorRT", "Portfolio presentation and career guidance"] }
    ],
    tools: [
      "PyTorch",
      "TensorFlow",
      "Keras",
      "CUDA",
      "Hugging Face",
      "OpenCV",
      "ONNX",
      "TensorRT",
      "Weights & Biases",
      "Colab Pro",
      "Docker"
    ],
    prerequisites: [],
    who_is_this_for: [],
  },
  {
    slug: "generative-ai",
    description: "Master the technology powering ChatGPT, Claude, and Gemini. Learn prompt engineering, RAG systems, LLM fine-tuning, and build production-ready GenAI applications that solve real business problems.",
    cover_image_url: "https://img.rocket.new/generatedImages/rocket_gen_img_14f24f844-1768587883889.png",
    long_description: [
      "Generative AI is transforming every industry. This course gives you the skills to build, deploy, and manage production GenAI applications. You'll work with the latest LLMs including GPT-4o, Claude 3.5, LLaMA 3, and Mistral, and learn to build RAG systems, AI agents, and fine-tuned models.",
      "Pune's financial, healthcare, and government sectors are rapidly adopting GenAI. This course prepares you to lead these initiatives with practical, production-grade skills."
    ],
    what_you_learn: [
      "Master advanced prompt engineering techniques",
      "Build RAG systems with vector databases",
      "Fine-tune LLMs with LoRA and QLoRA",
      "Create autonomous AI agents with LangChain",
      "Work with OpenAI, Anthropic, and Google APIs",
      "Deploy GenAI apps with safety guardrails",
      "Evaluate LLM applications with RAGAS",
      "Optimise costs and performance at scale"
    ],
    curriculum: [
      { week: "Week 1-2", title: "Foundations of Generative AI & LLMs", topics: ["History and evolution of language models", "Transformer architecture deep dive: attention, positional encoding", "GPT family: GPT-3, GPT-4, GPT-4o architecture and capabilities", "Open-source LLMs: LLaMA 3, Mistral, Gemma, Phi-3", "Tokenisation, embeddings, and vector representations"] },
      { week: "Week 3-4", title: "Prompt Engineering & LLM APIs", topics: ["Advanced prompt engineering techniques", "Chain-of-thought, few-shot, and zero-shot prompting", "OpenAI API, Anthropic Claude API, and Google Gemini API", "Structured outputs and function calling", "Cost optimisation and rate limiting strategies"] },
      { week: "Week 5-6", title: "RAG Systems & Knowledge Bases", topics: ["Retrieval-Augmented Generation (RAG) architecture", "Vector databases: Pinecone, Weaviate, ChromaDB", "Document chunking, embedding, and retrieval strategies", "Advanced RAG: HyDE, multi-query, reranking", "Building enterprise knowledge bases"] },
      { week: "Week 7-8", title: "Fine-tuning, Agents & Production GenAI", topics: ["Fine-tuning LLMs with LoRA and QLoRA", "LangChain and LlamaIndex for LLM applications", "Building autonomous AI agents with tool use", "Evaluation frameworks: RAGAS, TruLens", "Deploying GenAI apps to production with guardrails"] }
    ],
    tools: [
      "OpenAI API",
      "LangChain",
      "LlamaIndex",
      "Pinecone",
      "ChromaDB",
      "Hugging Face",
      "LLaMA",
      "Mistral",
      "LoRA",
      "RAGAS",
      "FastAPI",
      "Streamlit"
    ],
    prerequisites: [],
    who_is_this_for: [],
  },
  {
    slug: "ai-for-business",
    description: "Designed for executives, managers, and business professionals. Understand AI strategy, ROI, ethics, and how to lead successful AI transformation without needing to write a single line of code.",
    cover_image_url: "https://img.rocket.new/generatedImages/rocket_gen_img_198ad9e76-1766563899922.png",
    long_description: [
      "The AI for Business Leaders course is specifically designed for non-technical professionals who need to understand, evaluate, and lead AI initiatives. No coding required \u2014 just strategic thinking and business acumen.",
      "You'll learn how to identify AI opportunities in your organisation, build a compelling AI business case, manage AI teams, and navigate the ethical and regulatory landscape in Pune."
    ],
    what_you_learn: [
      "Understand AI, ML, and GenAI without technical jargon",
      "Build a compelling AI strategy for your organisation",
      "Measure and communicate AI ROI to stakeholders",
      "Lead and manage AI teams effectively",
      "Navigate India's AI governance landscape",
      "Identify and prioritise AI use cases",
      "Manage AI risks and ethical considerations",
      "Drive successful AI change management"
    ],
    curriculum: [
      { week: "Week 1", title: "AI Landscape for Business Leaders", topics: ["What is AI, ML, and GenAI \u2014 demystified for executives", "Current state of AI in Pune and across India", "AI maturity models and organisational readiness", "Key AI use cases across industries: finance, healthcare, retail", "Understanding AI capabilities and limitations"] },
      { week: "Week 2", title: "AI Strategy & Business Value", topics: ["Building an AI strategy aligned with business goals", "Identifying and prioritising AI opportunities", "AI ROI measurement frameworks", "Build vs buy vs partner decisions", "Creating an AI roadmap for your organisation"] },
      { week: "Week 3", title: "Leading AI Teams & Projects", topics: ["AI team structures: data scientists, ML engineers, AI product managers", "Managing AI projects: timelines, milestones, and KPIs", "Data strategy and data governance", "Vendor evaluation and AI procurement", "Change management for AI adoption"] },
      { week: "Week 4", title: "AI Ethics, Risk & Governance", topics: ["AI ethics frameworks and responsible AI principles", "India's evolving AI governance landscape (NITI Aayog)", "AI risk management and bias mitigation", "Regulatory compliance: the DPDP Act and AI regulations", "Building an AI governance committee"] }
    ],
    tools: [],
    prerequisites: [],
    who_is_this_for: [],
  },
  {
    slug: "nlp",
    description: "Build intelligent chatbots, voice assistants, and NLP pipelines. Master BERT, transformer models, and conversational AI frameworks to create systems that understand and generate human language.",
    cover_image_url: "https://img.rocket.new/generatedImages/rocket_gen_img_179e37808-1767170142529.png",
    long_description: [
      "Natural Language Processing is at the heart of the AI revolution. From customer service chatbots to document analysis systems, NLP powers the most impactful AI applications in Pune's banking, healthcare, and government sectors.",
      "This course has a special focus on Pune's multilingual context \u2014 you'll learn to build NLP systems that handle English, Mandarin, Malay, and Tamil, making your skills uniquely valuable in the local market."
    ],
    what_you_learn: [
      "Master NLP fundamentals and text processing",
      "Fine-tune BERT and transformer models",
      "Build production chatbots with Rasa and LangChain",
      "Implement semantic search with sentence transformers",
      "Develop voice assistants with Whisper",
      "Handle multilingual NLP for Pune context",
      "Deploy NLP models as scalable APIs",
      "Monitor and improve NLP systems in production"
    ],
    curriculum: [
      { week: "Week 1-2", title: "NLP Foundations & Text Processing", topics: ["NLP pipeline: tokenisation, stemming, lemmatisation", "Text representation: TF-IDF, word embeddings, Word2Vec, GloVe", "Sentiment analysis and text classification", "Named entity recognition (NER) and POS tagging", "spaCy and NLTK for NLP tasks"] },
      { week: "Week 3-4", title: "Transformer Models for NLP", topics: ["BERT architecture and pre-training objectives", "Fine-tuning BERT for classification, NER, and QA", "Sentence transformers and semantic search", "Cross-lingual models for multilingual NLP", "Hugging Face Transformers library mastery"] },
      { week: "Week 5-6", title: "Conversational AI & Chatbot Development", topics: ["Dialogue systems architecture: task-oriented vs open-domain", "Intent classification and entity extraction", "Building chatbots with Rasa and Dialogflow", "LLM-powered conversational agents with LangChain", "Multi-turn conversation management and context tracking"] },
      { week: "Week 7-8", title: "Voice AI & Production Deployment", topics: ["Speech recognition with Whisper and Google Speech API", "Text-to-speech synthesis with ElevenLabs and Azure", "Voice assistant development for Pune's multilingual context", "Deploying NLP models as REST APIs", "Monitoring and improving conversational AI in production"] }
    ],
    tools: [
      "spaCy",
      "NLTK",
      "Hugging Face",
      "BERT",
      "Rasa",
      "LangChain",
      "Whisper",
      "Dialogflow",
      "FastAPI",
      "Streamlit",
      "Pinecone",
      "Docker"
    ],
    prerequisites: [],
    who_is_this_for: [],
  }
];

const staticContentBySlug = Object.fromEntries(staticCourseContent.map(c => [c.slug, c]));
for (const course of courses) {
  const extra = staticContentBySlug[course.slug];
  if (extra) Object.assign(course, extra);
}

async function seedCourses() {
  for (const course of courses) {
    await prisma.course.upsert({ where: { slug: course.slug }, update: course, create: course });
  }
  console.log(`Seeded ${courses.length} courses.`);
}

async function seedJobs() {
  let count = 0;
  for (const job of openPositions) {
    const existing = await prisma.job.findFirst({ where: { title: job.title } });
    const data = {
      title: job.title,
      department: job.dept,
      location: job.location,
      work_mode: job.workMode,
      employment_type: job.type || 'Full-time',
      experience_level: job.experienceLevel,
      description: job.desc,
      requirements: job.requirements || [],
      is_active: true,
    };
    if (existing) {
      await prisma.job.update({ where: { id: existing.id }, data });
    } else {
      await prisma.job.create({ data });
    }
    count += 1;
  }
  console.log(`Seeded ${count} jobs.`);
}

async function getOrCreateContentAuthor() {
  const email = 'content@skandaplus.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const password_hash = await bcrypt.hash(`seed-${Date.now()}-${Math.random()}`, 12);
  return prisma.user.create({
    data: { name: 'SkandaPlus Team', email, password_hash, role: 'admin' },
  });
}

async function seedBlogs() {
  const author = await getOrCreateContentAuthor();
  for (const post of blogPosts) {
    const data = {
      author_id: author.id,
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      body: Array.isArray(post.body) ? post.body.join('\n\n') : post.body,
      image_url: post.image || null,
      image_alt: post.alt || null,
    };
    await prisma.blog.upsert({
      where: { slug: post.slug },
      update: data,
      create: { slug: post.slug, ...data },
    });
  }
  console.log(`Seeded ${blogPosts.length} blog posts.`);
}

async function seedAdminUser() {
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@skandaplus.com';
  const password = process.env.ADMIN_SEED_PASSWORD || 'Admin@12345';
  const password_hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: 'admin', password_hash },
    create: { name: 'Site Admin', email, password_hash, role: 'admin' },
  });

  // Never log the actual password — only confirm the login email and
  // point to where the password came from, so operators can look it up
  // themselves (their own env var, or the documented default) instead of
  // it sitting in plaintext in a terminal/CI log.
  console.log(`Admin login ready -> email: ${email}`);
  console.log(
    'Password is whatever ADMIN_SEED_PASSWORD is set to (or the documented default if unset). Change it after first login.'
  );
}

async function main() {
  await seedAdminUser();
  await seedCourses();
  await seedJobs();
  await seedBlogs();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
