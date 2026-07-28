import { Check, X } from 'lucide-react';
import type { QuizOption } from '../types/swr302';

type AnswerState = 'neutral' | 'selected' | 'correct' | 'incorrect' | 'revealed';

export function getAnswerState(
  optionId: string,
  selectedOptionIds: string[],
  correctOptionIds: string[],
  submitted: boolean
): AnswerState {
  const isSelected = selectedOptionIds.includes(optionId);
  const isCorrect = correctOptionIds.includes(optionId);

  if (!submitted) return isSelected ? 'selected' : 'neutral';
  if (isSelected && isCorrect) return 'correct';
  if (isSelected && !isCorrect) return 'incorrect';
  if (isCorrect) return 'revealed';
  return 'neutral';
}

const stateClass: Record<AnswerState, string> = {
  neutral: 'border-line bg-panel hover:bg-panel2',
  selected: 'border-accent bg-accent/10 text-ink',
  correct: 'border-success bg-success/12 text-ink',
  incorrect: 'border-danger bg-danger/12 text-ink',
  revealed: 'border-success bg-success/12 text-ink'
};

export function AnswerOption({
  option,
  selectedOptionIds,
  correctOptionIds,
  submitted,
  disabled,
  onSelect
}: {
  option: QuizOption;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  submitted: boolean;
  disabled: boolean;
  onSelect: (optionId: string) => void;
}) {
  const state = getAnswerState(option.id, selectedOptionIds, correctOptionIds, submitted);
  const label =
    state === 'correct' || state === 'revealed'
      ? 'Correct answer'
      : state === 'incorrect'
        ? 'Incorrect answer'
        : state === 'selected'
          ? 'Selected'
          : null;

  return (
    <button
      className={`w-full rounded-md border p-4 text-left transition-colors ${stateClass[state]}`}
      aria-pressed={selectedOptionIds.includes(option.id)}
      disabled={disabled}
      onClick={() => onSelect(option.id)}
    >
      <span className="flex items-start gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-panel2 text-sm font-bold">
          {option.originalLabel}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block whitespace-pre-wrap text-sm leading-6">{option.text}</span>
          {label ? (
            <span
              className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${
                state === 'incorrect' ? 'text-danger' : state === 'selected' ? 'text-accent' : 'text-success'
              }`}
            >
              {state === 'incorrect' ? <X size={14} /> : <Check size={14} />}
              {label}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}
