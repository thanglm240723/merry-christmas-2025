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
    const [isReady, setIsReady] = useState<boolean>(false); // ✅ Track player ready state

    const playerRef = useRef<any>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isMountedRef = useRef<boolean>(true); // ✅ Track component mounted

    const playlist: Song[] = [
        { cover: '/images/Merry-Christmas.png', title: 'Merry Christmas Mr. Lawrence', artist: 'Ryuichi Sakamoto', duration: '', youtubeId: 'ELJf83TelA0' },
        { cover: '/images/TakeMyHand.jpg', title: 'Take My Hand', artist: 'Dance Dashi!', duration: '', youtubeId: '-wTLvPuFK7I' },
        { cover: '/images/AllIWantForChristmasIsYou.png', title: 'All I Want for Christmas Is You', artist: 'Mariah Carey', duration: '', youtubeId: 'aAkMkVFwAoo' },
        { cover: '/images/LastChristmas.png', title: 'Last Christmas', artist: 'Wham!', duration: '', youtubeId: 'KhqNTjbQ71A' },
        { cover: '/images/SilentNight.png', title: 'Silent Night', artist: 'Traditional', duration: '', youtubeId: 'nEH7_2c644Q' },
        { cover: '/images/JingleBell.png', title: 'Jingle Bell ', artist: 'Bobby Helms', duration: '', youtubeId: '3CWJNqyub3o' },
    ];

    const currentSong = playlist[playingIndex];

    // ✅ 1. Load YouTube SDK
    useEffect(() => {
        isMountedRef.current = true;

        const loadYouTubeAPI = () => {
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
                // ✅ Đợi một chút để đảm bảo DOM đã render
                setTimeout(() => {
                    if (isMountedRef.current) {
                        initPlayer();
                    }
                }, 100);
            }
        };

        loadYouTubeAPI();

        return () => {
            isMountedRef.current = false;
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            // ✅ Cleanup player
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }
        };
    }, []);

    // ✅ 2. Initialize Player
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
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    rel: 0,
                    enablejsapi: 1, // ✅ Enable JS API
                },
                events: {
                    onReady: (event: any) => {
                        console.log('Player ready');
                        setIsReady(true);
                        setDuration(event.target.getDuration());
                    },
                    onStateChange: (event: any) => {
                        // ✅ Update playing state based on player state
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
                        // ✅ Auto skip to next on error
                        handleNext();
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing player:', error);
        }
    };

    // ✅ 3. Update progress timer
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
            }, 500); // ✅ Update every 500ms for smoother progress
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

    // ✅ 4. Handle song change
    useEffect(() => {
        if (!isReady || !playerRef.current) return;

        const changeSong = async () => {
            try {
                // ✅ Stop current playback first
                if (playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
                    playerRef.current.pauseVideo();
                }

                // ✅ Load new video
                playerRef.current.loadVideoById({
                    videoId: currentSong.youtubeId,
                    startSeconds: 0
                });

                // ✅ Wait for video to load
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
        // ✅ Don't manually set isPlaying - let onStateChange handle it
    };

    const handlePrev = () => {
        setPlayingIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
        // ✅ Don't manually set isPlaying - let onStateChange handle it
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

    // ✅ Handle playlist item click
    const handleSongClick = (index: number) => {
        setPlayingIndex(index);
        // ✅ Auto play after changing song
        setTimeout(() => {
            if (playerRef.current && isReady) {
                playerRef.current.playVideo();
            }
        }, 600);
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
                        disabled={!isReady} // ✅ Disable when not ready
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
        </aside>
    );
};

export default MusicPlayer;