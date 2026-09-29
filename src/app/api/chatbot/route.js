const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_CONTEXT = `You are the AI Plus Assistant for SkandaPlus, an AI/ML training institute.
Help visitors with questions about courses (AI Fundamentals, Machine Learning, Deep Learning,
Generative AI & LLMs, AI for Business Leaders, NLP), fees, batches, and placement support.
Keep replies short (2-3 sentences) and friendly. If you don't know something specific
(exact fees, dates), tell them to contact the team via the Contact page.`;

export async function POST(request) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Chatbot not configured' }, { status: 500 });
    }

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_CONTEXT }] },
      { role: 'model', parts: [{ text: 'Understood, I will help visitors with that context.' }] },
      ...(Array.isArray(history) ? history : []),
      { role: 'user', parts: [{ text: message }] },
    ];

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API error:', res.status, errText);
      return Response.json({ error: 'Chatbot request failed' }, { status: 502 });
    }

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't come up with a reply — please try again.";

    return Response.json({ reply });
  } catch (err) {
    console.error('Chatbot route error:', err);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
