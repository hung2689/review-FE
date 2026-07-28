import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { DataReviewPage } from './DataReviewPage';

describe('DataReviewPage access gate', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('requires the 4-digit password before showing review data', async () => {
    render(<DataReviewPage />);

    expect(screen.getByRole('heading', { name: 'Data review đang khóa' })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Tìm theo nội dung, id hoặc tên ảnh')).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Mật khẩu'), '1111');
    await userEvent.click(screen.getByRole('button', { name: 'Mở Data review' }));

    expect(screen.getByText(/Mật khẩu không đúng/)).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Mật khẩu'));
    await userEvent.type(screen.getByLabelText('Mật khẩu'), '2689');
    await userEvent.click(screen.getByRole('button', { name: 'Mở Data review' }));

    expect(screen.getByRole('heading', { name: 'Data review' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tìm theo nội dung, id hoặc tên ảnh')).toBeInTheDocument();
  });
});
