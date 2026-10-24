import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const APP_PASSWORD = process.env.APP_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

const COOKIE_NAME = 'sohaib_ai_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
function sign(value: string) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
}
function makeSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}
function isValidSession(req: Request) {
  const cookieHeader = req.headers.cookie || '';
  const entry = cookieHeader.split(';').map(v => v.trim()).find(v => v.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return false;
  const token = decodeURIComponent(entry.slice(COOKIE_NAME.length + 1));
  const [expiresText, signature, extra] = token.split('.');
  if (!expiresText || !signature || extra || !/^\d+$/.test(expiresText)) return false;
  if (Number(expiresText) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, sign(expiresText));
}
function requireLogin(req: Request, res: Response, next: NextFunction) {
  if (!APP_PASSWORD || !SESSION_SECRET) {
    return res.status(503).json({ error: 'Server setup incomplete. Set APP_PASSWORD and SESSION_SECRET.' });
  }
  if (!isValidSession(req)) return res.status(401).json({ error: 'Please sign in to use Sohaib AI.' });
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', appName: 'Sohaib AI', provider: 'OpenRouter', configured: Boolean(OPENROUTER_API_KEY && APP_PASSWORD && SESSION_SECRET) });
});

app.get('/api/me', (req, res) => {
  if (!APP_PASSWORD || !SESSION_SECRET) {
    return res.status(503).json({ authenticated: false, error: 'Server setup incomplete. Set APP_PASSWORD and SESSION_SECRET.' });
  }
  res.json({ authenticated: isValidSession(req) });
});

let loginAttempts = new Map<string, { count: number; startedAt: number }>();
app.post('/api/login', (req, res) => {
  if (!APP_PASSWORD || !SESSION_SECRET) {
    return res.status(503).json({ error: 'Server setup incomplete. Set APP_PASSWORD and SESSION_SECRET.' });
  }
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  if (attempt && now - attempt.startedAt < 10 * 60 * 1000 && attempt.count >= 10) {
    return res.status(429).json({ error: 'Too many login attempts. Wait 10 minutes and try again.' });
  }
  if (!attempt || now - attempt.startedAt >= 10 * 60 * 1000) loginAttempts.set(ip, { count: 1, startedAt: now });
  else loginAttempts.set(ip, { ...attempt, count: attempt.count + 1 });

  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!safeEqual(password, APP_PASSWORD)) {
    return res.status(401).json({ error: 'Incorrect password. Try again.' });
  }
  loginAttempts.delete(ip);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(makeSession())}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE}${secure}`);
  res.json({ authenticated: true });
});

app.post('/api/logout', (_req, res) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
  res.json({ ok: true });
});

const SOHAIB_AI_SYSTEM_INSTRUCTION = `You are Sohaib AI, a helpful AI assistant created by Sohaib.
You understand Moroccan Darija (Arabic script and Latin Arabizi), Modern Standard Arabic, French, and English.
Reply in the language the user uses unless they request another language. If they write in Moroccan Darija, answer naturally in Moroccan Darija.
Help with general questions, learning, writing, translation, programming, and practical tasks. Be clear, honest, polite, and useful. Use Markdown when it improves readability. Never claim you performed an action you did not perform.`;

app.post('/api/chat', requireLogin, async (req: Request, res: Response) => {
  try {
    if (!OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your hosting secrets.' });
    }
    const { messages, preferredLanguage } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 60) {
      return res.status(400).json({ error: 'Messages must be a non-empty array with no more than 60 entries.' });
    }
    const conversation = messages
      .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-40)
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 20000) }));
    if (!conversation.length) return res.status(400).json({ error: 'No valid messages found.' });

    const languageNote = typeof preferredLanguage === 'string' ? `\nPreferred response language: ${preferredLanguage}.` : '';
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://sohaib-ai.pages.dev',
        'X-Title': 'Sohaib AI',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openrouter/free',
        messages: [
          { role: 'system', content: SOHAIB_AI_SYSTEM_INSTRUCTION + languageNote },
          ...conversation,
        ],
        temperature: 0.7,
      }),
    });
    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('OpenRouter error:', response.status, data?.error?.message || 'Unknown provider error');
      const message = response.status === 401
        ? 'OpenRouter rejected the API key. Check OPENROUTER_API_KEY.'
        : response.status === 429
          ? 'The free model is busy or its usage limit has been reached. Wait a little or choose another available free model.'
          : (data?.error?.message || `OpenRouter returned ${response.status}.`);
      return res.status(response.status >= 500 ? 502 : response.status).json({ error: message });
    }
    const replyText = data?.choices?.[0]?.message?.content;
    if (typeof replyText !== 'string' || !replyText.trim()) {
      return res.status(502).json({ error: 'The AI provider returned an empty response. Please try again.' });
    }
    return res.json({
      role: 'assistant',
      content: replyText,
      model: data?.model || process.env.OPENROUTER_MODEL || 'openrouter/free',
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error?.message || error);
    return res.status(500).json({ error: 'Could not reach the AI provider. Check your connection and try again.' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sohaib AI server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
    if (!APP_PASSWORD || !SESSION_SECRET || !OPENROUTER_API_KEY) {
      console.warn('Setup required: configure OPENROUTER_API_KEY, APP_PASSWORD, and SESSION_SECRET.');
    }
  });
}
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
