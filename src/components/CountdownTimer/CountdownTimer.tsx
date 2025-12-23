import React, { useEffect, useState } from 'react';
import './CountdownTimer.css';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const CountdownTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [eventName, setEventName] = useState<string>('');

    useEffect(() => {
        // Cấu hình ngày Tết
        const tetDates: { [key: number]: Date } = {
            2025: new Date(2025, 0, 29), // 29/01/2025
            2026: new Date(2026, 1, 17),
            2027: new Date(2027, 1, 6),
        };

        const calculateTime = () => {
            const now = new Date();
            const currentYear = now.getFullYear();

            // Mốc Giáng Sinh: 00:00:00 ngày 25/12
            const xmasDate = new Date(currentYear, 11, 25, 0, 0, 0);

            let targetDate: Date;
            let label: string;

            if (now < xmasDate) {
                targetDate = xmasDate;
                label = "Sắp tới Giáng Sinh 🎄";
            } else {
                const nextYear = currentYear + 1;
                targetDate = tetDates[nextYear] || new Date(nextYear, 1, 1);
                label = `Sắp tới Tết ${nextYear} 🧧`;
            }

            const diff = targetDate.getTime() - now.getTime();

            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
                setEventName(label);
            } else {
                // Đã đến giờ G
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setEventName(label.includes('Giáng Sinh') ? 'Merry Christmas!' : 'Happy New Year!');
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000); // Cập nhật mỗi giây

        return () => clearInterval(timer);
    }, []);

    // Helper function để thêm số 0 đằng trước (vd: 09 thay vì 9)
    const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

    return (
        <div className="countdown-wrapper">
            <div className="event-title">{eventName}</div>

            <div className="timer-container">
                {/* Box Ngày */}
                <div className="time-box">
                    <span className="time-value">{timeLeft.days}</span>
                    <span className="time-label">Ngày</span>
                </div>

                {/* Box Giờ */}
                <div className="time-box">
                    <span className="time-value">{formatNumber(timeLeft.hours)}</span>
                    <span className="time-label">Giờ</span>
                </div>

                {/* Box Phút */}
                <div className="time-box">
                    <span className="time-value">{formatNumber(timeLeft.minutes)}</span>
                    <span className="time-label">Phút</span>
                </div>

                {/* Box Giây */}
                <div className="time-box">
                    <span className="time-value" style={{ color: '#e74c3c' }}>
                        {formatNumber(timeLeft.seconds)}
                    </span>
                    <span className="time-label">Giây</span>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;