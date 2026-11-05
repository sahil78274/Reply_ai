/**
 * Google Gemini AI service.
 * Generates human-like replies using the business knowledge base +
 * conversation history.
 */
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export const generateReply = async ({
  apiKey,
  message,
  language = 'hinglish',
  personality,
  knowledgeBase,
  history = [],
}) => {
  if (!apiKey) throw new Error('Gemini API key not configured');

  const kbText = buildKnowledgeText(knowledgeBase);
  const historyText = buildHistoryText(history);
  const langInstruction = languageInstruction(language);

  const systemPrompt = `You are a WhatsApp Business assistant for "${knowledgeBase.businessName || 'the business'}".

${personality || 'Be friendly, helpful, professional, and concise.'}

Business knowledge:
${kbText}

Conversation history (most recent last):
${historyText}

Language rules:
${langInstruction}

CRITICAL RULES:
1. Reply ONLY in WhatsApp message style: short, natural, conversational. No markdown bolding, no bullet lists, no headings, no "As an AI language model" phrases.
2. Never invent prices, policies, timings, or any business facts not present in the knowledge base above. If you don't know something, say you'll check with the owner and get back to them.
3. If the question is complicated, a complaint, a refund request, or anything outside the knowledge base, reply politely that you're forwarding it to the business owner who will respond personally. Do not attempt to solve it yourself.
4. Support Hindi, English and Hinglish naturally. Match the customer's language.
5. Never output more than 2-3 short sentences unless absolutely necessary.

Current customer message: "${message}"

Reply:`;

  const res = await fetch(`${BASE}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 250,
        topP: 0.9,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Gemini API error: ${res.status}`);
    err.status = res.status;
    err.apiResponse = data;
    throw err;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  return text.trim();
};

const buildKnowledgeText = (kb) => {
  if (!kb) return 'No business knowledge base configured yet.';
  const lines = [];
  if (kb.businessName) lines.push(`Business Name: ${kb.businessName}`);
  if (kb.businessDescription) lines.push(`Description: ${kb.businessDescription}`);
  if (kb.contactInformation) lines.push(`Contact: ${kb.contactInformation}`);
  if (kb.businessTimings) lines.push(`Timings: ${kb.businessTimings}`);
  if (kb.productsAndServices?.length) {
    lines.push('Products & Services:');
    for (const p of kb.productsAndServices) {
      lines.push(`- ${p.name}: ${p.description}${p.price ? ` (Price: ${p.price})` : ''}`);
    }
  }
  if (kb.pricing?.length) {
    lines.push('Pricing:');
    for (const p of kb.pricing) {
      lines.push(`- ${p.item}: ${p.price}${p.details ? ` - ${p.details}` : ''}`);
    }
  }
  if (kb.faqs?.length) {
    lines.push('FAQs:');
    for (const f of kb.faqs) {
      lines.push(`Q: ${f.question} A: ${f.answer}`);
    }
  }
  return lines.length ? lines.join('\n') : 'No business knowledge configured yet.';
};

const buildHistoryText = (history) => {
  if (!history.length) return '(no previous messages)';
  return history
    .map((m) => `${m.direction === 'inbound' ? 'Customer' : 'You'}: ${m.content}`)
    .join('\n');
};

const languageInstruction = (language) => {
  if (language === 'en') return 'Reply in English only.';
  if (language === 'hi') return 'Reply in Hindi (Devanagari script) only.';
  return 'Reply in Hinglish (natural mix of Hindi and English, written in the Latin/English script) — the way people actually text on WhatsApp in India.';
};
