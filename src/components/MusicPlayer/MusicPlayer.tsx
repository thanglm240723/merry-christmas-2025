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
    const [isReady, setIsReady] = useState<boolean>(false);
    const [showStartButton, setShowStartButton] = useState<boolean>(true);
    const [isInAppBrowser, setIsInAppBrowser] = useState<boolean>(false);

    const playerRef = useRef<any>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isMountedRef = useRef<boolean>(true);

    const playlist: Song[] = [
        { cover: '/images/Merry-Christmas.png', title: 'Merry Christmas Mr. Lawrence', artist: 'Ryuichi Sakamoto', duration: '', youtubeId: 'ELJf83TelA0' },
        { cover: '/images/TakeMyHand.jpg', title: 'Take My Hand', artist: 'Dance Dashi!', duration: '', youtubeId: '-wTLvPuFK7I' },
        { cover: '/images/AllIWantForChristmasIsYou.png', title: 'All I Want for Christmas Is You', artist: 'Mariah Carey', duration: '', youtubeId: 'aAkMkVFwAoo' },
        { cover: '/images/LastChristmas.png', title: 'Last Christmas', artist: 'Wham!', duration: '', youtubeId: 'KhqNTjbQ71A' },
        { cover: '/images/SilentNight.png', title: 'Silent Night', artist: 'Traditional', duration: '', youtubeId: 'nEH7_2c644Q' },
        { cover: '/images/JingleBell.png', title: 'Jingle Bell ', artist: 'Bobby Helms', duration: '', youtubeId: '3CWJNqyub3o' },
    ];

    const currentSong = playlist[playingIndex];


    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        setIsInAppBrowser(/zalo|fban|fbav|instagram/.test(userAgent));


        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                if (isMountedRef.current) console.log("YouTube API Ready");
            };
        }

        return () => { isMountedRef.current = false; };
    }, []);

    // 2. Hàm khởi tạo Player (Sẽ gọi khi User bấm Start)
    const initPlayer = () => {
        if (!window.YT || !window.YT.Player) return;

        playerRef.current = new window.YT.Player('youtube-player-container', {
            height: '0',
            width: '0',
            videoId: currentSong.youtubeId,
            playerVars: {
                autoplay: 1,      // Ép chạy ngay
                mute: 1,          // QUAN TRỌNG: Mute để qua mặt WebView
                controls: 0,
                disablekb: 1,
                rel: 0,
                playsinline: 1,   // QUAN TRỌNG: Chạy bên trong trình duyệt, không mở app YT
                enablejsapi: 1,
                origin: window.location.origin,
            },
            events: {
                onReady: (event: any) => {
                    setIsReady(true);
                    setDuration(event.target.getDuration());
                    setShowStartButton(false);

                    // Sau khi đã "lách" được luật bằng mute, ta mở tiếng lại
                    event.target.unMute();
                    event.target.setVolume(100);
                    event.target.playVideo();
                },
                onStateChange: (event: any) => {
                    if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
                    else if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
                    else if (event.data === window.YT.PlayerState.ENDED) handleNext();
                },
                onError: () => handleNext()
            }
        });
    };

    const handleStartMusic = () => {
        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            // Trường hợp mạng chậm SDK chưa load xong
            alert("Đang tải dữ liệu, vui lòng thử lại sau giây lát!");
        }
    };

    // 3. Update Progress
    useEffect(() => {
        if (isPlaying && isReady) {
            timerRef.current = setInterval(() => {
                if (playerRef.current?.getCurrentTime) {
                    setCurrentTime(playerRef.current.getCurrentTime());
                }
            }, 500);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying, isReady]);

    // 4. Chuyển bài
    useEffect(() => {
        if (!isReady || !playerRef.current) return;
        playerRef.current.loadVideoById({
            videoId: currentSong.youtubeId,
            startSeconds: 0
        });
        playerRef.current.playVideo();
    }, [playingIndex, isReady]);

    const togglePlay = () => {
        if (!isReady || !playerRef.current) return;
        isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
    };

    const handleNext = () => setPlayingIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
    const handlePrev = () => setPlayingIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        playerRef.current?.seekTo(time, true);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60) || 0;
        const secs = Math.floor(seconds % 60) || 0;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const openInBrowser = () => window.open(window.location.href, '_blank');

    return (
        <aside className="music-player">
            {/* Div chứa Iframe ẩn */}
            <div id="youtube-player-container"></div>

            <div className="music-header">
                <div className="header-content">
                    <div className="header-text">Giáng Sinh An Lành! 🎶</div>
                    <div className="sub-text">Cùng lắng nghe giai điệu lễ hội nào!</div>
                </div>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            {showStartButton ? (
                <div className="start-music-container">
                    <button className="start-music-btn" onClick={handleStartMusic}>
                        🎵 Bắt đầu nghe nhạc
                    </button>
                    {isInAppBrowser && (
                        <div className="webview-notice">
                            <p style={{ fontSize: '11px', color: '#999', marginTop: '10px' }}>
                                💡 Nếu không nghe được, hãy <span onClick={openInBrowser} style={{ color: '#e74c3c', textDecoration: 'underline', cursor: 'pointer' }}>mở bằng trình duyệt</span>
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="current-track">
                        <div className="track-info-large">
                            <h3>{currentSong.title}</h3>
                            <p>{currentSong.artist}</p>
                        </div>

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
                            <li
                                key={i}
                                className={`playlist-item ${playingIndex === i ? 'playing' : ''}`}
                                onClick={() => setPlayingIndex(i)}
                            >
                                <div className="playlist-cover" style={{ backgroundImage: `url(${song.cover})` }}></div>
                                <div className="playlist-info">
                                    <div className="song-title">{song.title}</div>
                                    <div className="song-artist">{song.artist}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </aside>
    );
};

export default MusicPlayer;