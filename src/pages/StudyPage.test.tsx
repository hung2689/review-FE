import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { StudyPage } from './StudyPage';

describe('StudyPage', () => {
  it('shows the source image, confirmed answer, and fallback explanation', () => {
    render(<StudyPage />);

    expect(screen.getByRole('heading', { name: 'Chế độ học bài' })).toBeInTheDocument();
    expect(screen.getByAltText('Source slide_019.png')).toHaveAttribute('src', '/input-images/slide_019.png');
    expect(screen.getByText('Đáp án đúng: B')).toBeInTheDocument();
    expect(screen.getByText(/Đáp án đúng đã được xác nhận từ ghi chú slide/)).toBeInTheDocument();
  });

  it('filters to a question with a detailed explanation', async () => {
    render(<StudyPage />);

    await userEvent.type(screen.getByPlaceholderText('Tìm câu hỏi, đáp án, giải thích, tên ảnh'), 'product champions');

    expect(screen.getByText('What do product champions do? Choose 2 correct answers.')).toBeInTheDocument();
    expect(screen.getByText('Đáp án đúng: A, B')).toBeInTheDocument();
    expect(screen.getByText(/Product champion đại diện cho người dùng/)).toBeInTheDocument();
  });
});
