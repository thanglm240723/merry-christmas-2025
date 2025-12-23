import React, { useState } from 'react';
import { Avatar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import './ChristmasModal.css';

interface Wish {
    title: string;
    content: string;
    imageUrl?: string;
}

interface ChristmasModalProps {
    onClose: () => void;
}

const ChristmasModal: React.FC<ChristmasModalProps> = ({ onClose }) => {
    // --- STATE ---
    const [currentSlide, setCurrentSlide] = useState<number>(0);

    // --- DATA ---
    const wishes: Wish[] = [
        {
            title: "Chúc Mừng Giáng Sinh! 🎅",
            content: "Chúc bạn có một mùa lễ ấm áp và tràn đầy niềm vui! Mong mọi điều tốt đẹp sẽ đến với bạn.",
            imageUrl: "/images/Santa.jpg"
        },
        {
            title: "Happy New Year! ✨",
            content: "Cầu mong năm mới sẽ mang lại thật nhiều sức khỏe, may mắn và thành công cho bạn và gia đình.",
            imageUrl: "/images/tuan-loc.jpg"
        },
        {
            title: "Merry Christmas! 🎄",
            content: "Hãy tận hưởng những khoảnh khắc tuyệt vời bên người thân yêu nhé! Giáng sinh an lành.",
            imageUrl: "/images/nguoi-tuyet.jpg"
        }
    ];

    // --- LOGIC ---
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === wishes.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? wishes.length - 1 : prev - 1));
    };

    return (
        <div className="modal-overlay">
            <div className="christmas-card">
                {/* Nút đóng */}
                <button className="close-card" onClick={onClose}>
                    ×
                </button>

                {/* --- BỔ SUNG 4 ICON TRANG TRÍ --- */}
                <div className="deco-icon top-left"><span>🎄</span></div>
                <div className="deco-icon top-right"><span>🌟</span></div>
                <div className="deco-icon bottom-left"><span>🎁</span></div>
                <div className="deco-icon bottom-right"><span>🔔</span></div>
                {/* -------------------------------- */}


                {/* Nội dung chính */}
                <div className="card-content">
                    <div className="santa-circle">
                        <Avatar
                            key={currentSlide}
                            alt={wishes[currentSlide].title}
                            src={wishes[currentSlide].imageUrl}
                            sx={{
                                width: 80,
                                height: 80,
                                border: '6px solid #e74c3c',
                                boxShadow: '0 8px 25px rgba(231, 76, 60, 0.3)',
                                p: 1,
                                bgcolor: 'white',
                                '& img': {
                                    objectFit: 'contain !important',
                                    transform: 'scale(1.2) translateY(2px)',
                                    transition: 'transform 0.3s ease',
                                    animation: 'fadeIn 0.5s ease-in-out'
                                }
                            }}
                        />
                    </div>

                    <h2 className="card-title">{wishes[currentSlide].title}</h2>
                    <p className="card-body">{wishes[currentSlide].content}</p>

                    {/* Slider Controls */}
                    <div className="slider-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '25px' }}>


                        <IconButton
                            onClick={prevSlide}
                            disableRipple={true}
                            sx={{
                                width: '55px',       // Kích thước nút
                                height: '55px',
                                backgroundColor: '#e74c3c', // Màu đỏ
                                color: 'white',      // Màu icon trắng
                                boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#c0392b', // Màu khi hover
                                    transform: 'scale(1.1)',    // Phóng to nhẹ
                                },
                                // Chỉnh kích thước ICON bên trong
                                '& svg': {
                                    fontSize: '28px', // Tăng giảm số này để icon to nhỏ tuỳ ý
                                    strokeWidth: 1.5, // Độ đậm nhạt (chỉ áp dụng nếu icon hỗ trợ, hoặc dùng fontSize to là đủ)
                                }
                            }}
                        >
                            <ArrowBackIosNewIcon />
                        </IconButton>

                        {/* Dots - Giữ nguyên logic cũ */}
                        <div className="dots">
                            {wishes.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`dot ${currentSlide === idx ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(idx)}
                                ></span>
                            ))}
                        </div>

                        {/* Nút Next */}
                        <IconButton
                            onClick={nextSlide}
                            disableRipple={true}
                            sx={{
                                width: '55px',
                                height: '55px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#c0392b',
                                    transform: 'scale(1.1)',
                                },
                                '& svg': {
                                    fontSize: '28px',
                                }
                            }}
                        >
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ChristmasModal;