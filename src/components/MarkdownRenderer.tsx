import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Parse markdown into code blocks vs text blocks
  const parts: { type: 'code' | 'text'; language?: string; code?: string; text?: string }[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: content.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      code: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      text: content.slice(lastIndex),
    });
  }

  let codeBlockCounter = 0;

  return (
    <div className="space-y-3 leading-relaxed text-slate-200">
      {parts.map((part, pIdx) => {
        if (part.type === 'code' && part.code) {
          const currentIndex = codeBlockCounter++;
          const isCopied = copiedIndex === currentIndex;

          return (
            <div
              key={pIdx}
              className="my-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/90 text-sm shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs font-mono text-slate-400">
                <span className="uppercase tracking-wider text-amber-400/90 font-medium">
                  {part.language || 'code'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(part.code!, currentIndex)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                  aria-label="Copy code to clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-sans">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="font-sans">Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs md:text-sm text-slate-200 leading-normal selection:bg-amber-500/30">
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }

        // Render formatted text
        return <TextFormatter key={pIdx} rawText={part.text || ''} />;
      })}
    </div>
  );
};

const TextFormatter: React.FC<{ rawText: string }> = ({ rawText }) => {
  // Split into paragraphs by double newlines
  const paragraphs = rawText.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((paragraph, paraIdx) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        // Horizontal dividers
        if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
          return <hr key={paraIdx} className="my-4 border-slate-800/80" />;
        }

        // Check for headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={paraIdx} className="text-base font-semibold text-white mt-4 mb-2">
              {formatInlineStyles(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={paraIdx} className="text-lg font-semibold text-white mt-4 mb-2">
              {formatInlineStyles(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={paraIdx} className="text-xl font-bold text-white mt-4 mb-2">
              {formatInlineStyles(trimmed.slice(2))}
            </h2>
          );
        }

        // Check for bullet lists
        const lines = trimmed.split('\n');
        const isBulletList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
        if (isBulletList && lines.length > 0) {
          return (
            <ul key={paraIdx} className="my-2 list-disc list-inside space-y-1 pl-1 text-slate-300">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="leading-relaxed">
                  {formatInlineStyles(line.trim().replace(/^[-*]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        // Check for numbered lists
        const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()));
        if (isNumberedList && lines.length > 0) {
          return (
            <ol key={paraIdx} className="my-2 list-decimal list-inside space-y-1 pl-1 text-slate-300">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="leading-relaxed">
                  {formatInlineStyles(line.trim().replace(/^\d+\.\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // Check for blockquotes
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={paraIdx}
              className="my-3 border-l-2 border-amber-500/70 pl-3 italic text-slate-300 bg-amber-500/5 py-1 rounded-r-md"
            >
              {formatInlineStyles(trimmed.replace(/^>\s*/gm, ''))}
            </blockquote>
          );
        }

        // Regular paragraph with single-newline breaks
        return (
          <p key={paraIdx} className="whitespace-pre-line text-slate-200">
            {formatInlineStyles(trimmed)}
          </p>
        );
      })}
    </>
  );
};

// Helper for inline styles: [link](url), **bold**, *italic*, `inline code`
function formatInlineStyles(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const regex = /(\[.*?\]\(https?:\/\/.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      tokens.push(text.slice(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const splitIdx = token.indexOf('](');
      const label = token.slice(1, splitIdx);
      const url = token.slice(splitIdx + 2, -1);
      tokens.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors font-medium"
        >
          {label}
        </a>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={match.index} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        <em key={match.index} className="italic text-slate-300">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code
          key={match.index}
          className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-amber-300"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIdx = match.index + token.length;
  }

  if (lastIdx < text.length) {
    tokens.push(text.slice(lastIdx));
  }

  return tokens.length > 0 ? tokens : [text];
}
