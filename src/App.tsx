import { useState } from 'react';
import './App.css';
import Snowfall from './components/Snallfall/Snowfall';
import ChristmasModal from './components/ChristmasModal/ChristmasModal';
import CountdownTimer from './components/CountdownTimer/CountdownTimer';
import MusicPlayer from './components/MusicPlayer/MusicPlayer'; // Import mới

function App() {
  const [showMusicPlayer, setShowMusicPlayer] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(true);

  return (
    <div className="app-container">
      <Snowfall />
      <CountdownTimer />
      {/* Nav */}
      <nav className="app-nav">
        <a href="#">Trang Chủ</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setShowMusicPlayer(true); }}>Nghe Nhạc</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setShowModal(true); }}>Thiệp</a>
        <a href="#">Kỷ Niệm</a>
        <a href="#">Sự Kiện</a>
        <button aria-label="Fullscreen">
          <svg className="screen-icon" viewBox="0 0 24 24">
            <path d="M3 4h18v12H3z" stroke="currentColor" fill="none" strokeWidth="2" />
            <path d="M8 20h8v-2H8z" fill="currentColor" />
          </svg>
        </button>
      </nav>

      {/* Gom nhóm cây và xe/mèo để dễ căn giữa */}
      <div className="center-content">
        <div className="tree-container">
          <img src="/images/tree-2.png" alt="Christmas Tree" className="christmas-tree-img" />
        </div>
      </div>


      {/* --- COMPONENT MODAL --- */}
      {showModal && <ChristmasModal onClose={() => setShowModal(false)} />}

      {/* --- COMPONENT MUSIC PLAYER --- */}
      {showMusicPlayer && <MusicPlayer onClose={() => setShowMusicPlayer(false)} />}
    </div>
  );
}

export default App;