import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { QuizQuestion } from '../src/types/swr302';
import { cleanAnswerText, cleanQuestionText } from '../src/utils/textCleanup';

const ROOT = process.cwd();
const QUESTIONS_PATH = path.join(ROOT, 'src', 'data', 'swr302-questions.json');
const AUDIT_PATH = path.join(ROOT, 'data', 'text-cleanup-report.json');

type CleanupChange = {
  id: string;
  field: string;
  before: string;
  after: string;
};

async function main() {
  const questions = JSON.parse(await readFile(QUESTIONS_PATH, 'utf8')) as QuizQuestion[];
  const changes: CleanupChange[] = [];

  for (const question of questions) {
    const cleanedQuestion = cleanQuestionText(question.question);
    if (cleanedQuestion !== question.question) {
      changes.push({ id: question.id, field: 'question', before: question.question, after: cleanedQuestion });
      question.question = cleanedQuestion;
    }

    question.topic = cleanQuestionText(question.topic);

    for (const option of question.options) {
      const cleanedOption = cleanAnswerText(option.text);
      if (cleanedOption !== option.text) {
        changes.push({ id: question.id, field: `option ${option.originalLabel}`, before: option.text, after: cleanedOption });
        option.text = cleanedOption;
      }
    }
  }

  await writeFile(QUESTIONS_PATH, `${JSON.stringify(questions, null, 2)}\n`, 'utf8');
  await writeFile(
    AUDIT_PATH,
    `${JSON.stringify(
      {
        changedFields: changes.length,
        changedQuestions: new Set(changes.map((change) => change.id)).size,
        sample: changes.slice(0, 25)
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  console.log(
    JSON.stringify(
      {
        changedFields: changes.length,
        changedQuestions: new Set(changes.map((change) => change.id)).size,
        auditPath: AUDIT_PATH,
        sample: changes.slice(0, 8)
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
