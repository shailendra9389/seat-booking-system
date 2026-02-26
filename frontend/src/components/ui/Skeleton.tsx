import React from 'react';

interface SkeletonProps {
    className?: string;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`skeleton ${className}`} />
            ))}
        </>
    );
};

export const SeatSkeleton: React.FC = () => (
    <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-12 rounded-lg" />
        ))}
    </div>
);

export const CardSkeleton: React.FC = () => (
    <div className="glass-card p-6 space-y-4">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-8 w-20" />
        <div className="skeleton h-3 w-24" />
    </div>
);
