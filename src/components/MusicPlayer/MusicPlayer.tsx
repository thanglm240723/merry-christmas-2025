import React, { useState, useEffect, useRef } from 'react';
import './MusicPlayer.css';

interface Song {
    cover: string;
    title: string;
    artist: string;
    duration: string;
    youtubeId: string;
}

interface MusicPlayerProps {
    onClose: () => void;
}

// Khai báo kiểu cho YouTube API (để tránh lỗi TypeScript)
declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ onClose }) => {
    const [playingIndex, setPlayingIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);

    const playerRef = useRef<any>(null); // Lưu trữ instance của YouTube Player
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const playlist: Song[] = [
        { cover: '../public/images/Merry-Christmas.png', title: 'Merry Christmas Mr. Lawrence', artist: 'Ryuichi Sakamoto', duration: '', youtubeId: 'ELJf83TelA0' },
        { cover: '../public/images/TakeMyHand.jpg', title: 'Take My Hand', artist: 'Dance Dashi!', duration: '', youtubeId: '-wTLvPuFK7I' },
        { cover: '../public/images/AllIWantForChristmasIsYou.png', title: 'All I Want for Christmas Is You', artist: 'Mariah Carey', duration: '', youtubeId: 'aAkMkVFwAoo' },
        { cover: '../public/images/LastChristmas.png', title: 'Last Christmas', artist: 'Wham!', duration: '', youtubeId: 'KhqNTjbQ71A' },
        { cover: '../public/images/SilentNight.png', title: 'Silent Night', artist: 'Traditional', duration: '', youtubeId: 'nEH7_2c644Q' },
        { cover: '../public/images/JingleBell.png', title: 'Jingle Bell ', artist: 'Bobby Helms', duration: '', youtubeId: '3CWJNqyub3o' },
    ];

    const currentSong = playlist[playingIndex];

    // 1. Tải YouTube SDK
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                initPlayer();
            };
        } else {
            initPlayer();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // 2. Khởi tạo Player
    const initPlayer = () => {
        playerRef.current = new window.YT.Player('youtube-player-container', {
            height: '0',
            width: '0',
            videoId: currentSong.youtubeId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                rel: 0,
            },
            events: {
                onReady: (event: any) => {
                    setDuration(event.target.getDuration());
                },
                onStateChange: (event: any) => {
                    // Khi bài hát kết thúc (State = 0)
                    if (event.data === window.YT.PlayerState.ENDED) {
                        handleNext();
                    }
                }
            }
        });
    };

    // 3. Theo dõi thời gian (Progress)
    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                    setCurrentTime(playerRef.current.getCurrentTime());
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying]);

    // 4. Chuyển bài hát trong API
    useEffect(() => {
        if (playerRef.current && playerRef.current.loadVideoById) {
            playerRef.current.loadVideoById(currentSong.youtubeId);
            if (!isPlaying) playerRef.current.pauseVideo();
        }
    }, [playingIndex]);

    // Điều khiển
    const togglePlay = () => {
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        setPlayingIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
        setIsPlaying(true);
    };

    const handlePrev = () => {
        setPlayingIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
        setIsPlaying(true);
    };

    // Xử lý kéo thanh trượt
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        playerRef.current.seekTo(time, true);
    };

    // Hàm format thời gian (giây -> mm:ss)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <aside className="music-player">
            {/* Container ẩn cho YouTube Player */}
            <div id="youtube-player-container" style={{ display: 'none' }}></div>

            <div className="music-header">
                <div className="header-content">
                    <div className="header-text">Giáng Sinh An Lành! 🎶</div>
                    <div className="sub-text">Cùng lắng nghe giai điệu lễ hội nào!</div>
                </div>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="current-track">
                <div className="track-info-large">
                    <h3>{currentSong.title}</h3>
                    <p>{currentSong.artist}</p>
                </div>

                {/* --- THANH TIẾN TRÌNH (NEW) --- */}
                <div className="progress-area">
                    <input
                        type="range"
                        className="progress-bar"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                    />
                    <div className="time-info">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="player-controls">
                    <button onClick={handlePrev}>⏮</button>
                    <button className="play-btn" onClick={togglePlay}>
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button onClick={handleNext}>⏭</button>
                </div>
            </div>

            <div className="playlist-label">Danh Sách Phát</div>
            <ul className="playlist">
                {playlist.map((song, i) => (
                    <li key={i} className={`playlist-item ${playingIndex === i ? 'playing' : ''}`} onClick={() => { setPlayingIndex(i); setIsPlaying(true); }}>
                        <div className="playlist-cover" style={{ background: `url(${song.cover}) center/cover` }}></div>
                        <div className="playlist-info">
                            <div className="song-title">{song.title}</div>
                            <div className="song-artist">{song.artist}</div>
                        </div>
                        <div className="song-duration">{song.duration}</div>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default MusicPlayer;