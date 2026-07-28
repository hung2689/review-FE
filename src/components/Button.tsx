import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }>;

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accentInk hover:bg-accent/90 disabled:bg-accent/40',
  secondary: 'border border-line bg-panel text-ink hover:bg-panel2 disabled:text-muted',
  ghost: 'text-ink hover:bg-panel2 disabled:text-muted',
  danger: 'bg-danger text-accentInk hover:bg-danger/90 disabled:bg-danger/40'
};

export function Button({ children, className = '', variant = 'secondary', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

