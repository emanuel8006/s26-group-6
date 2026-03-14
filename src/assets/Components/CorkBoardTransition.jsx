import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CorkBoard.css';

const TransitionContext = createContext(null);

const PAGE_CARDS = {
  '/':               { x: -28, y: -10, rotate: -2.5, label: 'Home',          emoji: '🏠', color: '#D42B2B',  tape: 'both'  },
  '/dashboard':      { x:  24, y: -18, rotate:  3.5, label: 'Dashboard',     emoji: '📊', color: '#FFE45C',  tape: 'left'  },
  '/dining-dollars': { x: -24, y:  16, rotate: -3.5, label: 'Dining $',      emoji: '💰', color: '#4CAF50',  tape: 'right' },
  '/swipes':         { x:  26, y:  20, rotate:  2,   label: 'Swipes',        emoji: '🔄', color: '#2196F3',  tape: 'none'  },
  '/food-good':      { x:  -4, y:  28, rotate: -1.5, label: 'Is Food Good?', emoji: '⭐', color: '#FF9800',  tape: 'left'  },
  '/login':          { x:  28, y:  -1, rotate:  4.5, label: 'Login',         emoji: '🔑', color: '#9C27B0',  tape: 'right' },
};

const SCALE = 0.12;

export function usePageTransition() {
  return useContext(TransitionContext);
}

export default function CorkBoardTransition({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState('idle');
  const [target, setTarget] = useState(null);
  const [fromPath, setFromPath] = useState(null);
  const timeoutsRef = useRef([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);

  const navigateTo = useCallback((path) => {
    if (phase !== 'idle') return;
    if (path === location.pathname) return;

    clearAllTimeouts();
    setFromPath(location.pathname);
    setTarget(path);

    // Phase 1: zoom out current page to cork board
    setPhase('zoom-out');

    // Phase 2: after zoom-out, navigate + reposition instantly
    timeoutsRef.current.push(setTimeout(() => {
      navigate(path);
      setPhase('reposition');

      // Phase 3: need two rAF to ensure reposition paints before zoom-in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('zoom-in');

          timeoutsRef.current.push(setTimeout(() => {
            setPhase('idle');
            setTarget(null);
            setFromPath(null);
            window.scrollTo({ top: 0, behavior: 'instant' });
          }, 750));
        });
      });
    }, 800));
  }, [phase, location.pathname, navigate, clearAllTimeouts]);

  // Calculate content wrapper transform
  const currentCard = PAGE_CARDS[location.pathname] || PAGE_CARDS['/'];
  const fromCard = fromPath ? (PAGE_CARDS[fromPath] || PAGE_CARDS['/']) : null;
  const targetCard = target ? (PAGE_CARDS[target] || PAGE_CARDS['/']) : null;

  let wrapperStyle = {};

  switch (phase) {
    case 'zoom-out': {
      const c = currentCard;
      wrapperStyle = {
        transform: `scale(${SCALE}) translate(${c.x / SCALE}%, ${c.y / SCALE}%) rotate(${c.rotate}deg)`,
        transition: 'transform 0.75s cubic-bezier(0.4, 0, 0.15, 1)',
      };
      break;
    }
    case 'reposition': {
      const t = targetCard;
      wrapperStyle = {
        transform: `scale(${SCALE}) translate(${t.x / SCALE}%, ${t.y / SCALE}%) rotate(${t.rotate}deg)`,
        transition: 'none',
      };
      break;
    }
    case 'zoom-in': {
      wrapperStyle = {
        transform: 'scale(1) translate(0%, 0%) rotate(0deg)',
        transition: 'transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1)',
      };
      break;
    }
    default:
      wrapperStyle = { transform: 'none' };
  }

  const boardVisible = phase !== 'idle';

  // Determine which card to hide (the actual content is sitting on top of it)
  const hideCardPath = (phase === 'zoom-out' || phase === 'reposition')
    ? location.pathname
    : null;

  return (
    <TransitionContext.Provider value={navigateTo}>
      {/* Cork Board */}
      <div className={`cork-board-overlay ${boardVisible ? 'visible' : ''}`}>
        <div className="cork-board-surface">
          {/* NomNom sticker */}
          <div className="cork-sticker" style={{ top: '8%', left: '6%' }}>NomNom</div>

          {/* Decorative post-its */}
          <div className="cork-postit" style={{ top: '12%', right: '8%', background: '#FFE45C', transform: 'rotate(5deg)' }}>
            eat smarter!
          </div>
          <div className="cork-postit" style={{ bottom: '10%', left: '5%', background: '#ff9999', transform: 'rotate(-6deg)' }}>
            save $$$
          </div>

          {/* String connections */}
          <svg className="cork-strings" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d={`M ${50+PAGE_CARDS['/'].x} ${50+PAGE_CARDS['/'].y} C ${50} ${50}, ${50} ${50}, ${50+PAGE_CARDS['/dashboard'].x} ${50+PAGE_CARDS['/dashboard'].y}`} />
            <path d={`M ${50+PAGE_CARDS['/dashboard'].x} ${50+PAGE_CARDS['/dashboard'].y} C ${50+15} ${50+5}, ${50-5} ${50+10}, ${50+PAGE_CARDS['/dining-dollars'].x} ${50+PAGE_CARDS['/dining-dollars'].y}`} />
            <path d={`M ${50+PAGE_CARDS['/'].x} ${50+PAGE_CARDS['/'].y} C ${50-15} ${50+5}, ${50-10} ${50+15}, ${50+PAGE_CARDS['/food-good'].x} ${50+PAGE_CARDS['/food-good'].y}`} />
            <path d={`M ${50+PAGE_CARDS['/swipes'].x} ${50+PAGE_CARDS['/swipes'].y} C ${50+20} ${50+5}, ${50+20} ${50-5}, ${50+PAGE_CARDS['/login'].x} ${50+PAGE_CARDS['/login'].y}`} />
          </svg>

          {/* Page cards */}
          {Object.entries(PAGE_CARDS).map(([path, card]) => {
            const isCurrent = path === location.pathname;
            const isTarget = path === target;
            const isHidden = path === hideCardPath;

            return (
              <div
                key={path}
                className={`cork-card ${isCurrent ? 'cork-card-current' : ''} ${isTarget ? 'cork-card-target' : ''} ${isHidden ? 'cork-card-hidden' : ''}`}
                style={{
                  left: `${50 + card.x}%`,
                  top: `${50 + card.y}%`,
                  transform: `translate(-50%, -50%) rotate(${card.rotate}deg)`,
                }}
              >
                <div className="cork-pin" style={{ background: card.color }}></div>
                {(card.tape === 'left' || card.tape === 'both') && <div className="cork-tape cork-tape-left"></div>}
                {(card.tape === 'right' || card.tape === 'both') && <div className="cork-tape cork-tape-right"></div>}
                <div className="cork-card-inner">
                  <div className="cork-card-header" style={{ background: card.color }}></div>
                  <div className="cork-card-emoji">{card.emoji}</div>
                  <div className="cork-card-label">{card.label}</div>
                  <div className="cork-card-lines">
                    <div className="cork-line"></div>
                    <div className="cork-line"></div>
                    <div className="cork-line short"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content wrapper — gets scaled/translated */}
      <div className="cork-content-wrapper" style={wrapperStyle}>
        {children}
      </div>
    </TransitionContext.Provider>
  );
}