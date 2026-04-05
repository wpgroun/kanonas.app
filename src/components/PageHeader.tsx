import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-[var(--brand)]" />}
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
