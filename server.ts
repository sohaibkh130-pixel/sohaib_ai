import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini client with aistudio-build user agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SOHAIB_AI_SYSTEM_INSTRUCTION = `You are Sohaib AI (created by Sohaib), a world-class, sophisticated AI assistant.
You possess native fluency and cultural fluency in:
1. Moroccan Darija (الدارجة المغربية) — both in Arabic script and Latin Arabizi (using 3=ع, 7=ح, 9=ق, ch, dyal, kifach, chnou, etc.).
2. Modern Standard Arabic (العربية الفصحى).
3. French (Français).
4. English.

Core Responsibilities:
- Answer general questions accurately and helpfully.
- Explain topics clearly, breaking down complex concepts into intuitive explanations.
- Translate seamlessly between Moroccan Darija, Standard Arabic, French, and English, preserving cultural context and subtle nuances.
- Help with writing (professional emails, articles, creative prose, summaries).
- Excel at programming and computer science: provide clean, modern, production-grade code (TypeScript, React, Python, Node, SQL, C++, algorithms, debugging) with complete examples and explanations.

Tone & Conversation Rules:
- Reply in the language the user speaks to you in (unless explicitly requested otherwise). If the user writes in Darija, reply in warm, authentic Moroccan Darija ("مرحبا بيك، أنا سهيب AI", "salam khoya/khti, ana Sohaib AI").
- Maintain context of the entire conversation.
- Use markdown with code formatting, bullet points, and headers for clarity.
- Be polite, courteous, intellectually rigorous, and helpful.`;

// Health & Info endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Sohaib AI',
    model: 'gemini-3.8-flash',
    hasApiKey: Boolean(apiKey),
    timestamp: Date.now(),
  });
});

// Chat completion endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, preferredLanguage } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: "messages" array is required and must not be empty.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check GEMINI_API_KEY.',
      });
    }

    // Format messages for @google/genai
    // Each message has role 'user' or 'model'
    const contents = messages
      .filter((m: { role: string; content?: string }) => m && m.content && (m.role === 'user' || m.role === 'assistant'))
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content) }],
      }));

    if (contents.length === 0) {
      return res.status(400).json({ error: 'No valid user or assistant messages found.' });
    }

    let dynamicSystemInstruction = SOHAIB_AI_SYSTEM_INSTRUCTION;
    if (preferredLanguage) {
      dynamicSystemInstruction += `\nUser preferred response language override: ${preferredLanguage}.`;
    }

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let replyText = '';
    let usedModel = 'gemini-3.8-flash';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: dynamicSystemInstruction,
            temperature: 0.7,
          },
        });

        if (response.text) {
          replyText = response.text;
          usedModel = modelName;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt with ${modelName} encountered: ${err?.message || err}. Trying next fallback candidate if available.`);
        // Sleep briefly before trying next candidate
        await new Promise((res) => setTimeout(res, 800));
      }
    }

    if (!replyText && lastError) {
      throw lastError;
    }

    replyText = replyText || 'I could not generate a response. Please try again.';

    return res.json({
      role: 'assistant',
      content: replyText,
      model: usedModel,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const errorMessage = error?.message || 'Internal server error while generating response.';
    return res.status(500).json({
      error: errorMessage,
      details: error?.status || 'GEMINI_ERROR',
    });
  }
});

// Serve frontend in dev (via Vite middlewares) or in production
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
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sohaib AI server running at http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
