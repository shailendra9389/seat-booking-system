import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';

export function useCountdown(targetHour: number) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);

    const calculate = useCallback(() => {
        const now = dayjs();
        const target = now.hour(targetHour).minute(0).second(0);

        if (now.isAfter(target)) {
            setIsUnlocked(true);
            setTimeLeft('Buffer booking is open!');
        } else {
            setIsUnlocked(false);
            const diff = target.diff(now, 'second');
            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s until buffer unlock`);
        }
    }, [targetHour]);

    useEffect(() => {
        calculate();
        const timer = setInterval(calculate, 1000);
        return () => clearInterval(timer);
    }, [calculate]);

    return { timeLeft, isUnlocked };
}
