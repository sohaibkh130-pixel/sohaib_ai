import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatGeminiHistory,
  detectLanguage,
  generateChatTitle,
  exportSessionAsMarkdown,
  exportSessionAsJSON,
  extractCodeBlocks,
  type Message,
  type ChatSession,
} from './chatHelpers';

test('formatGeminiHistory maps roles and contents correctly', () => {
  const messages: Message[] = [
    { id: '1', role: 'user', content: 'Salam Sohaib', timestamp: 1000 },
    { id: '2', role: 'assistant', content: 'Marhba bik! Kifach n3awnk lyoma?', timestamp: 2000 },
    { id: '3', role: 'system', content: 'ignore this internal prompt', timestamp: 2500 },
    { id: '4', role: 'user', content: 'Bghit ntelem TypeScript', timestamp: 3000 },
  ];

  const geminiPayload = formatGeminiHistory(messages);

  assert.equal(geminiPayload.length, 3);
  assert.deepEqual(geminiPayload[0], {
    role: 'user',
    parts: [{ text: 'Salam Sohaib' }],
  });
  assert.deepEqual(geminiPayload[1], {
    role: 'model',
    parts: [{ text: 'Marhba bik! Kifach n3awnk lyoma?' }],
  });
  assert.deepEqual(geminiPayload[2], {
    role: 'user',
    parts: [{ text: 'Bghit ntelem TypeScript' }],
  });
});

test('detectLanguage correctly classifies Darija, Arabic, French, and English', () => {
  assert.equal(detectLanguage('Salam khoya labas 3lik?'), 'darija');
  assert.equal(detectLanguage('Kifach nsayeb website b React?'), 'darija');
  assert.equal(detectLanguage('واش ممكن تعاوني فبرمجة ديال الموقع؟'), 'darija');
  assert.equal(detectLanguage('السلام عليكم ورحمة الله، كيف يمكنني تعلم الذكاء الاصطناعي؟'), 'arabic');
  assert.equal(detectLanguage('Bonjour Sohaib, comment fonctionne cette architecture ?'), 'french');
  assert.equal(detectLanguage('What are the key benefits of using Gemini 3.8 Flash?'), 'english');
});

test('generateChatTitle truncates safely and creates clean titles', () => {
  assert.equal(generateChatTitle('Hello'), 'Hello');
  assert.equal(
    generateChatTitle('how to build a fullstack nextjs app with authentication and database'),
    'How to build a fullstack nextjs app...'
  );
  assert.equal(generateChatTitle(''), 'New Conversation');
});

test('exportSessionAsMarkdown formats full transcript with headers', () => {
  const session: ChatSession = {
    id: 'test-1',
    title: 'React Tutorial',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    messages: [
      { id: 'm1', role: 'user', content: 'What is useState?', timestamp: 1700000000000 },
      { id: 'm2', role: 'assistant', content: 'useState is a React Hook.', timestamp: 1700000005000 },
    ],
  };

  const md = exportSessionAsMarkdown(session);
  assert.match(md, /# React Tutorial/);
  assert.match(md, /\*\*You\*\*/);
  assert.match(md, /\*\*Sohaib AI\*\*/);
  assert.match(md, /useState is a React Hook\./);
});

test('extractCodeBlocks parses markdown fenced blocks', () => {
  const text = `
Here is the code:
\`\`\`typescript
const greeting = "Salam";
console.log(greeting);
\`\`\`
And in python:
\`\`\`python
print("Marhba")
\`\`\`
  `;

  const blocks = extractCodeBlocks(text);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].language, 'typescript');
  assert.equal(blocks[0].code, 'const greeting = "Salam";\nconsole.log(greeting);');
  assert.equal(blocks[1].language, 'python');
  assert.equal(blocks[1].code, 'print("Marhba")');
});
