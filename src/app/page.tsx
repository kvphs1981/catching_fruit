// pages/index.tsx or app/page.tsx (depending on your Next.js version)
'use client'; // Add this if using App Router

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Head from 'next/head';

// Types
interface Question {
  q: string;
  options: string[];
  correct: number;
}

interface Fruit {
  element: HTMLDivElement;
  correct: boolean;
  y: number;
  x: number;
  speed: number;
  size: number;
}

interface KeysPressed {
  left: boolean;
  right: boolean;
}

const BasketCatchingGame: React.FC = () => {
  // Add hydration state
  const [isClient, setIsClient] = useState(false);

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameRunning, setGameRunning] = useState(true);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [basketPosition, setBasketPosition] = useState(50);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'correct' | 'wrong'>('correct');
  const [showGameOver, setShowGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false); // Changed to false initially

  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  const fruitsRef = useRef<Fruit[]>([]);
  const messageTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const keysPressed = useRef<KeysPressed>({ left: false, right: false });
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Questions data
  const questions: Question[] = [
    { q: "🍎 What is 2 + 3? 🍎", options: ["4", "5", "6", "7"], correct: 1 },
    { q: "🌍 What is the capital of France? 🌍", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
    { q: "🕷️ How many legs does a spider have? 🕷️", options: ["6", "8", "10", "12"], correct: 1 },
    { q: "🎨 What color do you get mixing red and blue? 🎨", options: ["Green", "Purple", "Orange", "Yellow"], correct: 1 },
    { q: "➖ What is 10 - 4? ➖", options: ["5", "6", "7", "8"], correct: 1 },
    { q: "🐄 Which animal says 'moo'? 🐄", options: ["Pig", "Cow", "Sheep", "Horse"], correct: 1 },
    { q: "📅 How many days are in a week? 📅", options: ["5", "6", "7", "8"], correct: 2 },
    { q: "🪐 What is the largest planet? 🪐", options: ["Earth", "Jupiter", "Mars", "Venus"], correct: 1 }
  ];

  const fruitTypes = ['apple', 'orange', 'banana', 'grape'];

  // Helper functions
  const calculateFruitSize = (text: string): number => {
    const baseSize = 80;
    const maxSize = 180;
    const maxLength = 30;
    const textLength = text.length;
    const sizeFactor = Math.min(textLength / maxLength, 1);
    const calculatedSize = baseSize + (sizeFactor * (maxSize - baseSize));
    return Math.max(baseSize, Math.min(maxSize, calculatedSize));
  };

  const calculateFontSize = (fruitSize: number, textLength: number): number => {
    const baseFontSize = 12;
    const maxFontSize = 16;
    
    if (textLength <= 3) {
      return Math.min(maxFontSize, fruitSize / 5);
    } else if (textLength <= 10) {
      return Math.min(14, fruitSize / 6);
    } else {
      return Math.max(baseFontSize, fruitSize / 8);
    }
  };

  const createCatchEffect = (x: number, y: number) => {
    if (!gameAreaRef.current) return;
    
    for (let i = 0; i < 12; i++) {
      const effect = document.createElement('div');
      effect.className = 'catch-effect';
      effect.style.left = x + (Math.random() - 0.5) * 150 + 'px';
      effect.style.top = y + (Math.random() - 0.5) * 150 + 'px';
      effect.style.animationDelay = i * 0.05 + 's';
      gameAreaRef.current.appendChild(effect);
      
      setTimeout(() => effect.remove(), 1500);
    }
  };

  const displayMessage = (text: string, type: 'correct' | 'wrong') => {
    setMessageText(text);
    setMessageType(type);
    setShowMessage(true);
    
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
    }, 2500);
  };

  const updateBasketPosition = useCallback(() => {
    if (!gameAreaRef.current || !basketRef.current) return;
    
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const basketWidth = 120;
    const maxLeft = gameAreaRect.width - basketWidth;
    const leftPosition = (basketPosition / 100) * maxLeft;
    basketRef.current.style.left = leftPosition + 'px';
  }, [basketPosition]);

  const spawnAllFruits = useCallback(() => {
    if (!gameRunning || questionAnswered || !gameAreaRef.current) return;

    const q = questions[currentQuestion];
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const sectionWidth = gameAreaRect.width / 4;

    // Clear existing fruits
    fruitsRef.current.forEach(fruit => fruit.element.remove());
    fruitsRef.current = [];

    q.options.forEach((answer, index) => {
      const fruit = document.createElement('div');
      const fruitSize = calculateFruitSize(answer);
      const fontSize = calculateFontSize(fruitSize, answer.length);
      
      fruit.className = `fruit ${fruitTypes[index]}`;
      fruit.textContent = answer;
      
      fruit.style.width = fruitSize + 'px';
      fruit.style.height = fruitSize + 'px';
      fruit.style.fontSize = fontSize + 'px';
      fruit.style.lineHeight = '1.2';
      
      const xPosition = (index * sectionWidth) + (sectionWidth / 2) - (fruitSize / 2);
      const fruitLeft = Math.max(10, Math.min(gameAreaRect.width - fruitSize - 10, xPosition));
      fruit.style.left = fruitLeft + 'px';
      fruit.style.position = 'absolute';
      fruit.style.top = '-100px';
      
      gameAreaRef.current!.appendChild(fruit);
      fruitsRef.current.push({
        element: fruit,
        correct: (index === q.correct),
        y: -fruitSize - 20,
        x: fruitLeft,
        speed: 2 + Math.random() * 0.5,
        size: fruitSize
      });
    });
  }, [gameRunning, questionAnswered, currentQuestion]);

  const checkCollisions = useCallback(() => {
    if (!basketRef.current || !gameAreaRef.current) return;

    const basketRect = basketRef.current.getBoundingClientRect();
    
    fruitsRef.current.forEach((fruit, index) => {
      const fruitRect = fruit.element.getBoundingClientRect();
      
      if (fruitRect.bottom >= basketRect.top && 
          fruitRect.top <= basketRect.bottom &&
          fruitRect.right >= basketRef.current!.getBoundingClientRect().left && 
          fruitRect.left <= basketRef.current!.getBoundingClientRect().right) {
        
        createCatchEffect(fruitRect.left, fruitRect.top);
        
        if (fruit.correct) {
          setScore(prev => prev + 10);
          displayMessage('🎉 Perfect Catch! +10 points! 🎉', 'correct');
        } else {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameRunning(false);
              setShowGameOver(true);
            }
            return newLives;
          });
          displayMessage('❌ Wrong answer! -1 life! ❌', 'wrong');
        }
        
        setQuestionAnswered(true);
        
        fruitsRef.current.forEach(f => f.element.remove());
        fruitsRef.current = [];
        
        setTimeout(() => {
          setCurrentQuestion(prev => (prev + 1) % questions.length);
          setQuestionAnswered(false);
        }, 1500);
      }
    });
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameRunning) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    // Smooth basket movement
    if (keysPressed.current.left) {
      setBasketPosition(prev => Math.max(0, prev - 1.5));
    }
    if (keysPressed.current.right) {
      setBasketPosition(prev => Math.min(100, prev + 1.5));
    }
    
    // Update fruit positions
    fruitsRef.current.forEach((fruit) => {
      fruit.y += fruit.speed;
      fruit.element.style.top = fruit.y + 'px';
      
      if (fruit.y > (gameAreaRef.current?.offsetHeight || 0) + fruit.size + 50) {
        fruitsRef.current.forEach(f => f.element.remove());
        fruitsRef.current = [];
        if (!questionAnswered) {
          setTimeout(spawnAllFruits, 500);
        }
        return;
      }
    });
    
    checkCollisions();
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameRunning, questionAnswered, spawnAllFruits, checkCollisions]);

  const restartGame = () => {
    setGameRunning(true);
    setScore(0);
    setLives(3);
    setCurrentQuestion(0);
    setQuestionAnswered(false);
    setBasketPosition(50);
    setShowGameOver(false);
    setShowMessage(false);
    
    fruitsRef.current.forEach(fruit => fruit.element.remove());
    fruitsRef.current = [];
  };

  // Event handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameRunning || !gameAreaRef.current) return;
    
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const mouseX = e.clientX - gameAreaRect.left;
    const newPosition = (mouseX / gameAreaRect.width) * 100;
    setBasketPosition(Math.max(0, Math.min(100, newPosition)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!gameRunning || !gameAreaRef.current) return;
    
    const touch = e.touches[0];
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const touchX = touch.clientX - gameAreaRect.left;
    const newPosition = (touchX / gameAreaRect.width) * 100;
    setBasketPosition(Math.max(0, Math.min(100, newPosition)));
  };

  // Fix hydration issues with client-only initialization
  useEffect(() => {
    setIsClient(true);
    // Show instructions after client hydration
    const timer = setTimeout(() => setShowInstructions(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Effects
  useEffect(() => {
    if (isClient) {
      updateBasketPosition();
    }
  }, [basketPosition, updateBasketPosition, isClient]);

  useEffect(() => {
    if (!questionAnswered && gameRunning && isClient) {
      const timer = setTimeout(spawnAllFruits, 300);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, spawnAllFruits, questionAnswered, gameRunning, isClient]);

  useEffect(() => {
    if (isClient) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return () => {
        if (animationFrameRef.current !== undefined) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [gameLoop, isClient]);

  useEffect(() => {
    if (!isClient) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRunning) return;
      if (e.key === 'ArrowLeft') keysPressed.current.left = true;
      if (e.key === 'ArrowRight') keysPressed.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysPressed.current.left = false;
      if (e.key === 'ArrowRight') keysPressed.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameRunning, isClient]);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Basket Catching Quiz Game</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="particles" id="particles">
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 6 + 's',
              animationDuration: (3 + Math.random() * 3) + 's'
            }}
          />
        ))}
      </div>

      <div className="game-container">
        <div className="question-area">
          <div className="question">{questions[currentQuestion].q}</div>
          <div className="score">⭐ Score: <span>{score}</span> | 💖 Lives: <span>{lives}</span></div>
        </div>

        <div 
          className="game-area" 
          ref={gameAreaRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          <div className="basket" ref={basketRef}>🧺</div>
        </div>

        <div className="controls">
          🎯 Move your mouse or use arrow keys to move the basket and catch the correct fruit! 🎯
        </div>

        {showMessage && (
          <div className={`message ${messageType}`} style={{ display: 'block' }}>
            {messageText}
          </div>
        )}

        {showGameOver && (
          <div className="game-over" style={{ display: 'flex' }}>
            <div>🎮 Game Over! 🎮</div>
            <div>🏆 Final Score: <span>{score}</span> 🏆</div>
            <button className="restart-btn" onClick={restartGame}>🚀 Play Again</button>
          </div>
        )}

        {showInstructions && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            color: 'white',
            fontFamily: "'Fredoka One', cursive",
            textAlign: 'center',
            padding: '20px'
          }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '40px', 
              borderRadius: '20px', 
              backdropFilter: 'blur(10px)' 
            }}>
              <h2 style={{ marginBottom: '20px', color: '#ffd700' }}>🧺 How to Play 🧺</h2>
              <p style={{ marginBottom: '15px', fontSize: '18px' }}>🖱️ Move your mouse to control the basket</p>
              <p style={{ marginBottom: '15px', fontSize: '18px' }}>⬅️➡️ Or use arrow keys to move left/right</p>
              <p style={{ marginBottom: '15px', fontSize: '18px' }}>🎯 Catch the fruit with the correct answer</p>
              <p style={{ marginBottom: '15px', fontSize: '18px' }}>❌ Wrong answers cost you a life!</p>
              <p style={{ marginBottom: '15px', fontSize: '18px' }}>💖 Game ends when you run out of lives!</p>
              <p style={{ marginBottom: '15px', fontSize: '16px', color: '#ffd700' }}>🔍 Fruits will resize based on answer length!</p>
              <button 
                onClick={() => setShowInstructions(false)}
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontFamily: "'Fredoka One', cursive",
                  marginTop: '20px'
                }}
              >
                🚀 Start Catching!
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&family=Nunito:wght@400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        body {
          font-family: 'Nunito', sans-serif;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffd93d, #ff9ff3);
          background-size: 300% 300%;
          animation: rainbowShift 8s ease infinite;
          position: relative;
        }

        @keyframes rainbowShift {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 100%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
        }

        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: float 6s infinite linear;
        }

        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        .game-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          z-index: 5;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .question-area {
          text-align: center;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 25px;
          border-radius: 25px;
          margin-bottom: 20px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.15),
            0 0 20px rgba(255, 255, 255, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.7);
          transform: scale(1);
          animation: pulse 3s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .question {
          font-size: 24px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 15px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          font-family: 'Fredoka One', cursive;
        }

        .score {
          font-size: 18px;
          color: #e74c3c;
          font-weight: 600;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }

        .game-area {
          position: relative;
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border-radius: 25px;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.4);
          box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.1),
            inset 0 0 20px rgba(255, 255, 255, 0.2);
          margin-bottom: 15px;
        }

        .game-area::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 20%, rgba(255, 107, 107, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 80% 30%, rgba(78, 205, 196, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 40% 70%, rgba(255, 217, 61, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 70% 80%, rgba(150, 206, 180, 0.3) 0%, transparent 40%);
          animation: bubbleMove 10s ease-in-out infinite;
        }

        @keyframes bubbleMove {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -20px) rotate(90deg); }
          50% { transform: translate(-20px, 20px) rotate(180deg); }
          75% { transform: translate(20px, 20px) rotate(270deg); }
        }

        .fruit {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
          text-align: center;
          padding: 6px;
          font-family: 'Fredoka One', cursive;
          border: 4px solid rgba(255, 255, 255, 0.6);
          z-index: 10;
          top: -100px;
        }

        .apple {
          background: radial-gradient(circle at 30% 30%, #ff6b6b, #e55656, #cc4444);
          box-shadow: 0 8px 20px rgba(255, 107, 107, 0.6);
        }

        .orange {
          background: radial-gradient(circle at 30% 30%, #ffa500, #ff8c00, #cc8400);
          box-shadow: 0 8px 20px rgba(255, 165, 0, 0.6);
        }

        .banana {
          background: radial-gradient(circle at 30% 30%, #ffeb3b, #ffd600, #ccbc00);
          box-shadow: 0 8px 20px rgba(255, 235, 59, 0.6);
          color: #333;
          text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
        }

        .grape {
          background: radial-gradient(circle at 30% 30%, #9c27b0, #8e24aa, #7b1fa2);
          box-shadow: 0 8px 20px rgba(156, 39, 176, 0.6);
        }

        .basket {
          position: absolute;
          width: 120px;
          height: 60px;
          background: linear-gradient(45deg, #8b4513, #daa520, #cd853f, #d2691e);
          border-radius: 0 0 60px 60px;
          border: 3px solid #654321;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          font-weight: bold;
          z-index: 100;
          box-shadow: 
            0 8px 20px rgba(0, 0, 0, 0.4),
            inset 0 2px 8px rgba(255, 255, 255, 0.3);
          font-family: 'Fredoka One', cursive;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          transition: left 0.1s ease-out;
        }

        .basket::before {
          content: '';
          position: absolute;
          top: -12px;
          left: 8px;
          right: 8px;
          height: 15px;
          background: linear-gradient(45deg, #8b4513, #daa520);
          border-radius: 50px 50px 0 0;
          border: 3px solid #654321;
          border-bottom: none;
        }

        .message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          font-size: 32px;
          font-weight: bold;
          padding: 25px 40px;
          border-radius: 20px;
          text-align: center;
          z-index: 1000;
          font-family: 'Fredoka One', cursive;
          animation: messagePopIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        @keyframes messagePopIn {
          0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        }

        .correct {
          background: linear-gradient(45deg, #27ae60, #2ecc71);
          color: white;
          box-shadow: 0 10px 30px rgba(39, 174, 96, 0.4);
        }

        .wrong {
          background: linear-gradient(45deg, #e74c3c, #c0392b);
          color: white;
          box-shadow: 0 10px 30px rgba(231, 76, 60, 0.4);
        }

        .controls {
          text-align: center;
          color: #2c3e50;
          font-weight: 600;
          font-size: 16px;
          text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
          flex-shrink: 0;
        }

        .game-over {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: white;
          font-size: 28px;
          z-index: 1000;
          font-family: 'Fredoka One', cursive;
          backdrop-filter: blur(10px);
        }

        .restart-btn {
          margin-top: 25px;
          padding: 20px 40px;
          font-size: 20px;
          background: linear-gradient(45deg, #27ae60, #2ecc71);
          color: white;
          border: none;
          border-radius: 15px;
          cursor: pointer;
          font-weight: bold;
          font-family: 'Fredoka One', cursive;
          box-shadow: 0 8px 20px rgba(39, 174, 96, 0.4);
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .restart-btn:hover {
          background: linear-gradient(45deg, #2ecc71, #27ae60);
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(39, 174, 96, 0.6);
        }

        .catch-effect {
          position: absolute;
          width: 40px;
          height: 40px;
          background: radial-gradient(circle, #ffd700, #ffed4e);
          border-radius: 50%;
          pointer-events: none;
          animation: sparkle 1s ease-out forwards;
          z-index: 200;
        }

        @keyframes sparkle {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(4) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default BasketCatchingGame;