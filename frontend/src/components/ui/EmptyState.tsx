import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center fade-in">
        <div className="text-surface-400 mb-4">
            {icon || <AlertTriangle size={48} />}
        </div>
        <h3 className="text-lg font-semibold text-surface-200 mb-2">{title}</h3>
        {description && (
            <p className="text-surface-400 max-w-md mb-4">{description}</p>
        )}
        {action}
    </div>
);
