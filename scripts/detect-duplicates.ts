import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { QuizQuestion } from '../src/types/swr302';

const ROOT = process.cwd();
const QUESTIONS_PATH = path.join(ROOT, 'src', 'data', 'swr302-questions.json');
const DUPLICATES_PATH = path.join(ROOT, 'data', 'duplicate-questions.json');

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fingerprint(question: QuizQuestion) {
  return normalize(`${question.question} ${question.options.map((option) => `${option.originalLabel}:${option.text}`).join(' ')}`);
}

async function main() {
  const questions = JSON.parse(await readFile(QUESTIONS_PATH, 'utf8')) as QuizQuestion[];
  const byFingerprint = new Map<string, QuizQuestion[]>();

  for (const question of questions) {
    const key = fingerprint(question);
    const group = byFingerprint.get(key) ?? [];
    group.push(question);
    byFingerprint.set(key, group);
  }

  const duplicates = Array.from(byFingerprint.values())
    .filter((group) => group.length > 1)
    .map((group) => ({
      fingerprint: fingerprint(group[0]),
      questionIds: group.map((question) => question.id),
      sourceImages: Array.from(new Set(group.flatMap((question) => question.sourceImages)))
    }));

  await writeFile(DUPLICATES_PATH, `${JSON.stringify(duplicates, null, 2)}\n`, 'utf8');
  console.log(`Duplicate groups: ${duplicates.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

