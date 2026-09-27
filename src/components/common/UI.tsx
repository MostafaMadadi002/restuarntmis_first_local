import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-40 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5 font-black tracking-tight',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-md shadow-orange-500/25 focus:ring-orange-500',
    secondary:
      'bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold focus:ring-orange-200',
    outline:
      'border border-stone-200 hover:border-orange-300 hover:bg-orange-50/40 text-stone-700 focus:ring-stone-200',
    danger:
      'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-500 shadow-md shadow-rose-500/25',
    ghost:
      'hover:bg-stone-100 text-stone-500 hover:text-stone-900',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-md shadow-emerald-500/25',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'emerald' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}) {
  const styles = {
    success: 'bg-emerald-100 text-emerald-800 border-transparent',
    warning: 'bg-amber-100 text-amber-800 border-transparent',
    danger: 'bg-rose-100 text-rose-800 border-transparent',
    info: 'bg-sky-100 text-sky-800 border-transparent',
    neutral: 'bg-stone-100 text-stone-700 border-transparent',
    emerald: 'bg-emerald-600 text-white border-transparent',
    amber: 'bg-amber-500 text-white border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1 text-[11px] font-bold rounded-full',
    md: 'px-4 py-1.5 text-xs font-bold rounded-full',
  };

  return (
    <span className={`inline-flex items-center ${styles[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-stone-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:border-orange-100 hover:scale-[1.005] active:scale-[0.995]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-stone-50/50 border-2 border-dashed border-stone-200 rounded-3xl">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white shadow-xs text-stone-400 flex items-center justify-center mb-4 border border-stone-100">
          <Icon className="w-8 h-8 text-orange-500/70" />
        </div>
      )}
      <h3 className="text-base font-black text-stone-900">{title}</h3>
      <p className="text-xs text-stone-500 mt-1 max-w-sm font-medium">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
