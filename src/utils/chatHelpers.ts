/**
 * Pure logic helpers for Sohaib AI
 * Tested deterministically with node:test
 */

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  language?: 'darija' | 'arabic' | 'french' | 'english';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface GeminiContentPart {
  text: string;
}

export interface GeminiContentMessage {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

/**
 * Transforms application messages to Gemini API contents format.
 * Strips out system messages and maps 'assistant' to 'model'.
 */
export function formatGeminiHistory(messages: Message[]): GeminiContentMessage[] {
  return messages
    .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content.trim() }],
    }));
}

/**
 * Heuristic detector for supported languages in Sohaib AI:
 * - Moroccan Darija (Arabic script with Darija markers or Latin numbers 3, 7, 9, ch, dial, dyal, kifach, chnou)
 * - Modern Standard Arabic
 * - French
 * - English (default)
 */
export function detectLanguage(text: string): 'darija' | 'arabic' | 'french' | 'english' {
  if (!text || typeof text !== 'string') return 'english';
  const lower = text.toLowerCase().trim();

  // Moroccan Darija Latin / Arabizi clues
  const darijaKeywords = [
    'choukran', 'chokran', 'salam', 'khoya', 'khti', 'labas', 'kifach', 'chnou',
    'chnowa', 'dyal', 'dial', 'bzaf', 'wakha', 'daba', 'mzyan', 'mazian', '3afak',
    '3afek', 'ghadi', 'bghit', 'kayn', 'kayna', 'walou', 'hta', 'homa', 'ntoma',
    'nta', 'nti', 'wach', '3lach', 'feen', 'fin'
  ];
  const hasDarijaKeyword = darijaKeywords.some((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
  const hasArabiziNumerals = /[23579][a-zA-Z]|[a-zA-Z][23579]/.test(lower);

  // Arabic characters check
  const arabicCharCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const isArabicScript = arabicCharCount > text.length * 0.25;

  if (isArabicScript) {
    // Check if it has Moroccan Darija Arabic-script markers
    const darijaArabicPhrases = [
      'واش', 'ديال', 'بزاف', 'مزيان', 'دابا', 'عافاك', 'غادي', 'بغيت', 'كاين', 'كاينا', 'فين', 'شنو', 'كيداير', 'كيدايرة', 'خويا', 'أختي'
    ];
    if (darijaArabicPhrases.some((word) => text.includes(word))) {
      return 'darija';
    }
    return 'arabic';
  }

  if (hasDarijaKeyword || hasArabiziNumerals) {
    return 'darija';
  }

  // French detection clues
  const frenchKeywords = [
    'bonjour', 'merci', 'comment', 'pourquoi', 'avec', 'dans', 'pour', 'est-ce',
    'qu\'est-ce', 'vous', 'nous', 'c\'est', 'développement', 'français', 'aide',
    'salut', 's\'il vous plaît', 'code', 'fonction', 'écrire'
  ];
  const frenchMatches = frenchKeywords.filter((kw) => lower.includes(kw)).length;
  const hasAccents = /[éèêëàâôûùçîï]/.test(lower);

  if (frenchMatches >= 2 || (frenchMatches >= 1 && hasAccents)) {
    return 'french';
  }

  return 'english';
}

/**
 * Generates a concise title from the user's first prompt (up to 40 characters)
 */
export function generateChatTitle(prompt: string): string {
  if (!prompt || !prompt.trim()) return 'New Conversation';
  const clean = prompt
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= 36) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  const slice = clean.slice(0, 36);
  const lastSpace = slice.lastIndexOf(' ');
  const truncated = lastSpace > 15 ? slice.slice(0, lastSpace) : slice;
  return (truncated.charAt(0).toUpperCase() + truncated.slice(1)).trim() + '...';
}

/**
 * Exports a full conversation session as clean Markdown
 */
export function exportSessionAsMarkdown(session: ChatSession): string {
  const dateStr = new Date(session.createdAt).toLocaleString();
  const header = `# ${session.title}\n*Exported from Sohaib AI on ${dateStr}*\n\n---\n\n`;

  const body = session.messages
    .map((msg) => {
      const sender = msg.role === 'user' ? '**You**' : '**Sohaib AI**';
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `### ${sender} (${time})\n\n${msg.content}\n`;
    })
    .join('\n---\n\n');

  return header + body;
}

/**
 * Exports a conversation session as pretty-printed JSON
 */
export function exportSessionAsJSON(session: ChatSession): string {
  return JSON.stringify(session, null, 2);
}

/**
 * Extracts markdown code blocks from a response
 */
export function extractCodeBlocks(text: string): { language: string; code: string }[] {
  const blocks: { language: string; code: string }[] = [];
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
    });
  }

  return blocks;
}
