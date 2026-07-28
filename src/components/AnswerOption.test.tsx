import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AnswerOption, getAnswerState } from './AnswerOption';

const option = { id: 'SWR302-Q0001-OPT-A', originalLabel: 'A', text: 'Review' };

describe('AnswerOption', () => {
  it('marks a correct selected option green and shows Correct answer', () => {
    render(
      <AnswerOption
        option={option}
        selectedOptionIds={[option.id]}
        correctOptionIds={[option.id]}
        submitted
        disabled
        onSelect={() => undefined}
      />
    );

    expect(screen.getByText('Correct answer')).toBeInTheDocument();
    expect(getAnswerState(option.id, [option.id], [option.id], true)).toBe('correct');
  });

  it('marks a wrong selected option red and shows Incorrect answer', () => {
    render(
      <AnswerOption
        option={option}
        selectedOptionIds={[option.id]}
        correctOptionIds={['SWR302-Q0001-OPT-B']}
        submitted
        disabled
        onSelect={() => undefined}
      />
    );

    expect(screen.getByText('Incorrect answer')).toBeInTheDocument();
    expect(getAnswerState(option.id, [option.id], ['SWR302-Q0001-OPT-B'], true)).toBe('incorrect');
  });

  it('reveals the correct option after a wrong answer', () => {
    expect(getAnswerState('SWR302-Q0001-OPT-B', [option.id], ['SWR302-Q0001-OPT-B'], true)).toBe('revealed');
  });

  it('marks an unsubmitted picked option as selected', () => {
    expect(getAnswerState(option.id, [option.id], ['SWR302-Q0001-OPT-B'], false)).toBe('selected');
  });

  it('cannot be selected again after the answer is locked', async () => {
    const onSelect = vi.fn();
    render(
      <AnswerOption
        option={option}
        selectedOptionIds={[option.id]}
        correctOptionIds={[option.id]}
        submitted
        disabled
        onSelect={onSelect}
      />
    );

    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
