import React, { useEffect } from 'react';
import styles from './Snowfall.module.css';

const Snowfall: React.FC = () => {
    useEffect(() => {
        const container = document.createElement('div');
        container.className = styles.container;
        document.body.appendChild(container);

        // Bộ icon tuyết (thêm dấu chấm nếu font lỗi)
        const snowflakeChars = ['❄', '❅', '❆', '•', '*'];
        const count = 50;

        for (let i = 0; i < count; i++) {
            const flake = document.createElement('div');
            flake.className = styles.snowflake;

            flake.innerText = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
            const size = Math.random() * 20 + 10;

            flake.style.left = `${Math.random() * 100}vw`;
            flake.style.fontSize = `${size}px`;
            flake.style.animationDuration = `${Math.random() * 9 + 9}s`;
            flake.style.animationDelay = `-${Math.random() * 5}s`;
            flake.style.opacity = (Math.random() * 0.7 + 0.3).toString();

            const sway = Math.random() * 100 - 50;
            flake.style.setProperty('--sway', `${sway}px`);

            container.appendChild(flake);
        }

        return () => {
            container.remove();
        };
    }, []);

    return null;
};

export default Snowfall;