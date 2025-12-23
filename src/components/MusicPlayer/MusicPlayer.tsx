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
    const [showStartButton, setShowStartButton] = useState<boolean>(true); // ✅ Hiển thị nút Start
    const [isInAppBrowser, setIsInAppBrowser] = useState<boolean>(false); // ✅ Kiểm tra WebView

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

    // ✅ Kiểm tra xem có đang trong WebView (Zalo/FB) không
    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const isWebView =
            userAgent.includes('zalo') ||
            userAgent.includes('fban') ||
            userAgent.includes('fbav') ||
            userAgent.includes('instagram') ||
            (userAgent.includes('mobile') && !userAgent.includes('safari'));

        setIsInAppBrowser(isWebView);

        if (isWebView) {
            console.log('Đang chạy trong WebView (Zalo/Facebook)');
        }
    }, []);

    // ✅ Load YouTube SDK - chỉ khi user click Start
    const loadYouTubeAPI = () => {
        isMountedRef.current = true;

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                if (isMountedRef.current) {
                    initPlayer();
                }
            };
        } else {
            setTimeout(() => {
                if (isMountedRef.current) {
                    initPlayer();
                }
            }, 100);
        }
    };

    // ✅ Cleanup khi component unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }
        };
    }, []);

    // ✅ Initialize Player
    const initPlayer = () => {
        const container = document.getElementById('youtube-player-container');
        if (!container) {
            console.error('Player container not found');
            return;
        }

        try {
            playerRef.current = new window.YT.Player('youtube-player-container', {
                height: '0',
                width: '0',
                videoId: currentSong.youtubeId,
                playerVars: {
                    autoplay: 0, // ✅ Không autoplay
                    controls: 0,
                    disablekb: 1,
                    rel: 0,
                    enablejsapi: 1,
                    origin: window.location.origin, // ✅ Cần thiết cho WebView
                },
                events: {
                    onReady: (event: any) => {
                        console.log('Player ready');
                        setIsReady(true);
                        setDuration(event.target.getDuration());
                        setShowStartButton(false); // ✅ Ẩn nút Start
                    },
                    onStateChange: (event: any) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            setIsPlaying(true);
                        } else if (event.data === window.YT.PlayerState.PAUSED) {
                            setIsPlaying(false);
                        } else if (event.data === window.YT.PlayerState.ENDED) {
                            handleNext();
                        }
                    },
                    onError: (event: any) => {
                        console.error('YouTube Player Error:', event.data);
                        handleNext();
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing player:', error);
        }
    };

    // ✅ Handle Start Button Click
    const handleStartMusic = () => {
        console.log('User clicked Start - Loading YouTube API...');
        loadYouTubeAPI();
    };

    // ✅ Update progress timer
    useEffect(() => {
        if (isPlaying && isReady) {
            timerRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                    try {
                        const time = playerRef.current.getCurrentTime();
                        setCurrentTime(time);
                    } catch (error) {
                        console.error('Error getting current time:', error);
                    }
                }
            }, 500);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isPlaying, isReady]);

    // ✅ Handle song change
    useEffect(() => {
        if (!isReady || !playerRef.current) return;

        const changeSong = async () => {
            try {
                if (playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
                    playerRef.current.pauseVideo();
                }

                playerRef.current.loadVideoById({
                    videoId: currentSong.youtubeId,
                    startSeconds: 0
                });

                setTimeout(() => {
                    if (playerRef.current && playerRef.current.getDuration) {
                        const newDuration = playerRef.current.getDuration();
                        setDuration(newDuration);
                        setCurrentTime(0);
                    }
                }, 500);

            } catch (error) {
                console.error('Error changing song:', error);
            }
        };

        changeSong();
    }, [playingIndex, isReady]);

    // ✅ Control functions
    const togglePlay = () => {
        if (!isReady || !playerRef.current) return;

        try {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        } catch (error) {
            console.error('Error toggling play:', error);
        }
    };

    const handleNext = () => {
        setPlayingIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setPlayingIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isReady || !playerRef.current) return;

        try {
            const time = parseFloat(e.target.value);
            setCurrentTime(time);
            playerRef.current.seekTo(time, true);
        } catch (error) {
            console.error('Error seeking:', error);
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSongClick = (index: number) => {
        setPlayingIndex(index);
        setTimeout(() => {
            if (playerRef.current && isReady) {
                playerRef.current.playVideo();
            }
        }, 600);
    };

    // ✅ Open in external browser function
    const openInBrowser = () => {
        const currentUrl = window.location.href;
        window.open(currentUrl, '_blank');
    };

    return (
        <aside className="music-player">
            <div id="youtube-player-container" style={{ display: 'none' }}></div>

            <div className="music-header">
                <div className="header-content">
                    <div className="header-text">Giáng Sinh An Lành! 🎶</div>
                    <div className="sub-text">Cùng lắng nghe giai điệu lễ hội nào!</div>
                </div>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            {/* ✅ START BUTTON - Hiển thị khi chưa load player */}
            {showStartButton && (
                <div className="start-music-container">
                    <button className="start-music-btn" onClick={handleStartMusic}>
                        🎵 Bắt đầu nghe nhạc
                    </button>

                    {/* ✅ Thông báo nếu đang trong WebView */}
                    {isInAppBrowser && (
                        <div className="webview-notice">
                            <p style={{ fontSize: '11px', color: '#999', margin: '10px 0 0', lineHeight: 1.4 }}>
                                💡 Nếu không nghe được, vui lòng{' '}
                                <span
                                    onClick={openInBrowser}
                                    style={{
                                        color: '#e74c3c',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    mở bằng trình duyệt
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ✅ PLAYER CONTENT - Chỉ hiển thị khi đã load */}
            {!showStartButton && (
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
                                disabled={!isReady}
                            />
                            <div className="time-info">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="player-controls">
                            <button onClick={handlePrev} disabled={!isReady}>⏮</button>
                            <button className="play-btn" onClick={togglePlay} disabled={!isReady}>
                                {isPlaying ? '⏸' : '▶'}
                            </button>
                            <button onClick={handleNext} disabled={!isReady}>⏭</button>
                        </div>
                    </div>

                    <div className="playlist-label">Danh Sách Phát</div>
                    <ul className="playlist">
                        {playlist.map((song, i) => (
                            <li
                                key={i}
                                className={`playlist-item ${playingIndex === i ? 'playing' : ''}`}
                                onClick={() => handleSongClick(i)}
                            >
                                <div className="playlist-cover" style={{ background: `url(${song.cover}) center/cover` }}></div>
                                <div className="playlist-info">
                                    <div className="song-title">{song.title}</div>
                                    <div className="song-artist">{song.artist}</div>
                                </div>
                                <div className="song-duration">{song.duration}</div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </aside>
    );
};

export default MusicPlayer;