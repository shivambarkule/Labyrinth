import React, { useEffect, useRef, useState } from 'react';

// Helper: distance between two points
function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Helper: random position on screen
function getRandomPosition() {
  return {
    x: Math.random() * (window.innerWidth - 100) + 50,
    y: Math.random() * (window.innerHeight - 100) + 50
  };
}

// Pacman Game Component
const PacmanGame: React.FC = () => {
  const [head, setHead] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [gameActive, setGameActive] = useState(false);
  const [food, setFood] = useState<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const prevHead = useRef(head);
  const gameLoop = useRef<number | undefined>(undefined);

  // Hide default cursor and show custom cursor
  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.cursor = '';
    };
  }, []);

  // Handle mouse movement with smoothing
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setHead({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Game loop
  useEffect(() => {
    function updateGame() {
      // Track mouse movement for collision detection
      if (prevHead.current.x !== head.x || prevHead.current.y !== head.y) {
        // Mouse moved, update previous position
      }

      // Kite animation (optional - can add subtle effects here)

      // Check for food collision
      if (gameActive && food) {
        if (dist(head, food) < 20) {
          // Eat the food
          setScore(prev => prev + 1);
          setFood(null);
          
          // Spawn new food after a delay
          setTimeout(() => {
            setFood(getRandomPosition());
          }, 500);
        }
      }

      prevHead.current = head;
      gameLoop.current = requestAnimationFrame(updateGame);
    }
    
    gameLoop.current = requestAnimationFrame(updateGame);
    
    return () => {
      if (gameLoop.current) {
        cancelAnimationFrame(gameLoop.current);
      }
    };
  }, [head, gameActive, food]);

  // Check for trigger dot collision (fullstop after "Labyrinth" word)
  useEffect(() => {
    // Position of the fullstop after "Labyrinth" text in the logo
    // Using page coordinates (scroll + client position)
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const labyrinthFullstopPos = { 
      x: 192 + scrollX, // Position 2px to the right from previous position
      y: 55 + scrollY // Position at the proper baseline of the text (like a period)
    };
    
    if (!gameActive && dist(head, labyrinthFullstopPos) < 10) {
      setGameActive(true);
      setFood(getRandomPosition());
    }
  }, [head, gameActive]);

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {/* Score and Stop Button - positioned in upper right (below Admin card) */}
      {gameActive && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'normal',
              opacity: 0.8,
            }}
          >
            Score: {score}
          </div>
          <div
            onClick={() => setGameActive(false)}
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#ff4444',
              border: '1px solid #fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                backgroundColor: '#fff',
                margin: 'auto',
              }}
            />
          </div>
        </div>
      )}

      {/* Trigger dot (fullstop after "Labyrinth" word) */}
      {!gameActive && (
        <div
          style={{
            position: 'fixed',
            left: 192, // Position 2px to the right from previous position
            top: 55, // Position at the proper baseline of the text (like a period)
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid #333',
            boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            zIndex: 10000,
          }}
        />
      )}

      {/* Food ball (only one at a time) */}
      {gameActive && food && (
        <div
          style={{
            position: 'absolute',
            left: food.x - 4,
            top: food.y - 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid #333',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            zIndex: 10001,
          }}
        />
      )}

      {/* Custom White Pointer Cursor */}
      <div
        style={{
          position: 'absolute',
          left: head.x - 8,
          top: head.y - 8,
          width: 16,
          height: 16,
          zIndex: 10002,
          pointerEvents: 'none',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="black" floodOpacity="0.3"/>
            </filter>
          </defs>
          {/* White pointer arrow */}
          <path
            d="M0,0 L16,8 L8,16 L6,12 L0,0"
            fill="#fff"
            stroke="#000"
            strokeWidth="1"
            filter="url(#shadow)"
          />
        </svg>
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes pulse {
            from { transform: scale(1); }
            to { transform: scale(1.1); }
          }
          
          /* Remove pointer cursor from all clickable elements */
          * {
            cursor: none !important;
          }
          
          /* Keep pointer cursor only for the stop button */
          [style*="pointerEvents: auto"] {
            cursor: pointer !important;
          }
        `}
      </style>
    </div>
  );
};

const MouseCursor: React.FC = () => {
  return <PacmanGame />;
};

export default MouseCursor; 