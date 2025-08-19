'use client';

import React from 'react';
import { Question } from './questions';

interface GameUIProps {
  // Game state props
  isClient: boolean;
  isLandscape: boolean;
  isMobile: boolean;
  screenSize: { width: number; height: number };
  currentQuestion: number;
  score: number;
  lives: number;
  gameRunning: boolean;
  questionAnswered: boolean;
  basketPosition: number;
  showMessage: boolean;
  messageText: string;
  messageType: 'correct' | 'wrong';
  showGameOver: boolean;
  showInstructions: boolean;
  gameQuestions: Question[];
  currentCategory: string;
  currentQuestionData: Question | null;
  
  // Refs - Fixed to handle nullable types
  gameAreaRef: React.RefObject<HTMLDivElement | null>;
  basketRef: React.RefObject<HTMLDivElement | null>;
  
  // Utility functions
  getResponsiveValue: (mobile: number, tablet: number, desktop: number) => number;
  getBasketSize: () => { width: number; height: number };
  getFontSizes: () => {
    question: number;
    stats: number;
    message: number;
    gameOver: number;
  };
  
  // Handlers
  gameHandlers: {
    handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
    handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
    handleTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
    handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    generateNewQuestions: (category?: string) => void;
    shuffleQuestions: () => void;
    restartGame: () => void;
    setShowInstructions: (show: boolean) => void;
    handleFruitMissed: () => void; // New handler for when fruit is missed
  };
}

const GameUI: React.FC<GameUIProps> = ({
  isClient,
  isLandscape,
  isMobile,
  screenSize,
  currentQuestion,
  score,
  lives,
  gameRunning,
  questionAnswered,
  basketPosition,
  showMessage,
  messageText,
  messageType,
  showGameOver,
  showInstructions,
  gameQuestions,
  currentCategory,
  currentQuestionData,
  gameAreaRef,
  basketRef,
  getResponsiveValue,
  getBasketSize,
  getFontSizes,
  gameHandlers
}) => {
  
  // Add useEffect to handle fruit falling off screen
  React.useEffect(() => {
    if (!gameRunning || questionAnswered) return;

    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const checkFallingFruits = () => {
      const fruits = gameArea.querySelectorAll('.fruit');
      fruits.forEach((fruit) => {
        const fruitElement = fruit as HTMLElement;
        const rect = fruitElement.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        
        // Check if fruit has fallen below the game area
        if (rect.top > gameAreaRect.bottom) {
          // Fruit missed - remove it and handle the miss
          fruitElement.remove();
          if (gameHandlers.handleFruitMissed) {
            gameHandlers.handleFruitMissed();
          }
        }
      });
    };

    const interval = setInterval(checkFallingFruits, 100);
    return () => clearInterval(interval);
  }, [gameRunning, questionAnswered, gameAreaRef, gameHandlers]);

  // Question controls render function
  const renderQuestionControls = () => {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '10px',
        alignItems: 'center'
      }}>
        {/* Category buttons */}
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
         
          
        

       
          
        </div>
        
           
      </div>
    );
  };

  // Dynamic responsive styles
  const fontSizes = getFontSizes();
  const basketSize = getBasketSize();
  const padding = getResponsiveValue(10, 15, 20);
  const borderRadius = getResponsiveValue(15, 20, 25);

  const containerStyle: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: "'Nunito', sans-serif",
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffd93d, #ff9ff3)',
    backgroundSize: '300% 300%',
    animation: 'rainbowShift 8s ease infinite',
    position: 'relative',
    boxSizing: 'border-box'
  };

  const mainContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    zIndex: 5,
    padding: padding + 'px',
    display: 'flex',
    flexDirection: isLandscape ? 'row' : 'column',
    boxSizing: 'border-box',
    maxWidth: '100vw'
  };

  const questionAreaStyle: React.CSSProperties = {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: getResponsiveValue(15, 20, 25) + 'px',
    borderRadius: borderRadius + 'px',
    marginBottom: isLandscape ? '0' : padding + 'px',
    marginRight: isLandscape ? padding + 'px' : '0',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.5)',
    border: '2px solid rgba(255, 255, 255, 0.7)',
    flexShrink: 0,
    width: isLandscape ? Math.min(300, screenSize.width * 0.4) + 'px' : 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: '100%',
    boxSizing: 'border-box'
  };

  const gameAreaStyle: React.CSSProperties = {
    position: 'relative',
    flex: 1,
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(15px)',
    borderRadius: borderRadius + 'px',
    overflow: 'hidden',
    border: '3px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.2)',
    marginBottom: isLandscape ? '0' : padding + 'px',
    touchAction: 'none',
    minHeight: getResponsiveValue(250, 300, 350) + 'px',
    maxWidth: '100%',
    boxSizing: 'border-box'
  };

  return (
    <div style={containerStyle}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
      
      {/* Responsive particles */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}>
        {Array.from({ length: getResponsiveValue(20, 30, 50) }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: getResponsiveValue(6, 8, 10) + 'px',
              height: getResponsiveValue(6, 8, 10) + 'px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              animation: `float 6s infinite linear ${Math.random() * 6}s`
            }}
          />
        ))}
      </div>

      {/* Main Game Container */}
      <div style={mainContainerStyle}>
        {/* Question Area */}
        <div style={questionAreaStyle}>
          {currentQuestionData ? (
            <>
              <div style={{
                fontSize: fontSizes.question + 'px',
                fontWeight: 700,
                color: '#2c3e50',
                marginBottom: '15px',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
                fontFamily: "'Fredoka One', cursive",
                wordWrap: 'break-word',
                lineHeight: '1.3'
              }}>
                {currentQuestionData.question}
              </div>
              
              <div style={{
                fontSize: getResponsiveValue(8, 10, 12) + 'px',
                color: '#27ae60',
                fontWeight: 600,
                marginBottom: '5px'
              }}>
              </div>
              
              <div style={{
                fontSize: fontSizes.stats + 'px',
                color: '#e74c3c',
                fontWeight: 600,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'center',
                gap: getResponsiveValue(10, 15, 20) + 'px',
                flexWrap: 'wrap'
              }}>
                <span>⭐ Score: {score}</span>
                <span>💖 Lives: {lives}</span>
              </div>
              
              {/* Question generation controls */}
              {renderQuestionControls()}
              
              <div style={{
                textAlign: 'center',
                color: '#34495e',
                fontWeight: 600,
                fontSize: getResponsiveValue(10, 12, 14) + 'px',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                marginTop: '10px',
                wordWrap: 'break-word',
                lineHeight: '1.4'
              }}>
                🎯 {isMobile ? 'Touch & drag to move!' : 'Move mouse or arrow keys to move!'} 🎯
              </div>
            </>
          ) : (
            <div style={{
              fontSize: fontSizes.question + 'px',
              fontWeight: 700,
              color: '#e74c3c',
              textAlign: 'center'
            }}>
              📚 Loading Questions...
            </div>
          )}
        </div>

        {/* Game Area */}
        <div 
          ref={gameAreaRef}
          onMouseMove={!isMobile ? gameHandlers.handleMouseMove : undefined}
          onTouchStart={gameHandlers.handleTouchStart}
          onTouchMove={gameHandlers.handleTouchMove}
          onTouchEnd={gameHandlers.handleTouchEnd}
          style={gameAreaStyle}
        >
          {/* EXACT ORIGINAL South Indian Bamboo Basket Design */}
          <div 
            ref={basketRef}
            style={{
              position: 'absolute',
              width: basketSize.width + 'px',
              height: basketSize.height + 'px',
              bottom: '20px',
              left: '0px',
              transform: 'none',
              transition: 'left 0.05s ease-out',
              willChange: 'left',
              zIndex: 100,
              maxWidth: 'calc(100% - 40px)'
            }}
          >
            {/* Natural bamboo basket container */}
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              borderRadius: '6px 6px 55% 55%',
              overflow: 'hidden',
              filter: 'drop-shadow(0 6px 12px rgba(101, 67, 33, 0.4))'
            }}>
              
              {/* Main basket body with natural bamboo texture */}
              <div style={{
                width: '100%',
                height: '100%',
                background: `
                  radial-gradient(ellipse at center, 
                    #D2B48C 0%, 
                    #DEB887 15%,
                    #D2B48C 30%,
                    #CD853F 45%,
                    #D2B48C 60%,
                    #DEB887 75%,
                    #BC9A6A 90%,
                    #A0826B 100%
                  )
                `,
                borderRadius: '6px 6px 55% 55%',
                border: getResponsiveValue(1, 2, 3) + 'px solid #8B7355',
                position: 'relative',
                boxShadow: `
                  inset 0 3px 8px rgba(210, 180, 140, 0.6),
                  inset 0 -4px 10px rgba(101, 67, 33, 0.4),
                  0 4px 12px rgba(0, 0, 0, 0.25)
                `
              }}>
                
                {/* Natural bamboo horizontal strips */}
                {Array.from({ length: Math.floor(basketSize.height / (getResponsiveValue(7, 9, 11))) }, (_, i) => (
                  <div
                    key={`h-${i}`}
                    style={{
                      position: 'absolute',
                      top: (i * getResponsiveValue(7, 9, 11)) + 'px',
                      left: '5%',
                      right: '5%',
                      height: getResponsiveValue(3, 4, 5) + 'px',
                      background: `linear-gradient(to right, 
                        transparent 0%,
                        rgba(160, 130, 107, 0.5) 10%,
                        rgba(101, 67, 33, 0.3) 50%,
                        rgba(160, 130, 107, 0.5) 90%,
                        transparent 100%
                      )`,
                      borderRadius: '2px',
                      zIndex: 2
                    }}
                  />
                ))}
                
                {/* Natural bamboo vertical strips */}
                {Array.from({ length: Math.floor(basketSize.width / (getResponsiveValue(9, 11, 14))) }, (_, i) => (
                  <div
                    key={`v-${i}`}
                    style={{
                      position: 'absolute',
                      top: '8%',
                      bottom: '8%',
                      left: (8 + i * getResponsiveValue(9, 11, 14)) + 'px',
                      width: getResponsiveValue(2, 3, 4) + 'px',
                      background: `linear-gradient(to bottom, 
                        transparent 0%,
                        rgba(139, 115, 85, 0.4) 15%,
                        rgba(101, 67, 33, 0.6) 50%,
                        rgba(139, 115, 85, 0.4) 85%,
                        transparent 100%
                      )`,
                      borderRadius: '1px',
                      zIndex: 1
                    }}
                  />
                ))}
                
                {/* Natural bamboo rim */}
                <div style={{
                  position: 'absolute',
                  top: '-1px',
                  left: '-1px',
                  right: '-1px',
                  height: getResponsiveValue(6, 9, 12) + 'px',
                  background: `
                    linear-gradient(to bottom, 
                      #CD853F 0%, 
                      #DEB887 25%,
                      #D2B48C 50%, 
                      #BC9A6A 75%,
                      #A0826B 100%
                    )
                  `,
                  borderRadius: getResponsiveValue(8, 12, 15) + 'px ' + getResponsiveValue(8, 12, 15) + 'px 4px 4px',
                  border: getResponsiveValue(1, 1, 2) + 'px solid #654321',
                  boxShadow: `
                    0 2px 6px rgba(0,0,0,0.3),
                    inset 0 1px 3px rgba(222, 184, 135, 0.8),
                    inset 0 -1px 2px rgba(101, 67, 33, 0.6)
                  `,
                  zIndex: 10
                }} />
                
                {/* Natural bamboo rope handles */}
                <div style={{
                  position: 'absolute',
                  left: getResponsiveValue(-6, -9, -12) + 'px',
                  top: '25%',
                  width: getResponsiveValue(4, 6, 8) + 'px',
                  height: '50%',
                  background: `
                    repeating-linear-gradient(to bottom, 
                      #8B4513 0px, 
                      #A0522D 1px,
                      #CD853F 2px, 
                      #D2B48C 3px,
                      #8B4513 4px
                    )
                  `,
                  borderRadius: getResponsiveValue(3, 4, 5) + 'px',
                  border: '1px solid #5D2E0A',
                  transform: 'rotate(-3deg)',
                  boxShadow: '1px 2px 4px rgba(0,0,0,0.4)',
                  zIndex: 5
                }} />
                
                <div style={{
                  position: 'absolute',
                  right: getResponsiveValue(-6, -9, -12) + 'px',
                  top: '25%',
                  width: getResponsiveValue(4, 6, 8) + 'px',
                  height: '50%',
                  background: `
                    repeating-linear-gradient(to bottom, 
                      #8B4513 0px, 
                      #A0522D 1px,
                      #CD853F 2px, 
                      #D2B48C 3px,
                      #8B4513 4px
                    )
                  `,
                  borderRadius: getResponsiveValue(3, 4, 5) + 'px',
                  border: '1px solid #5D2E0A',
                  transform: 'rotate(3deg)',
                  boxShadow: '-1px 2px 4px rgba(0,0,0,0.4)',
                  zIndex: 5
                }} />
                
                {/* Natural interior shadow */}
                <div style={{
                  position: 'absolute',
                  top: '25%',
                  left: '10%',
                  right: '10%',
                  bottom: '15%',
                  background: `
                    radial-gradient(ellipse 80% 40% at center top, 
                      transparent 0%, 
                      rgba(0,0,0,0.08) 50%, 
                      rgba(101, 67, 33, 0.2) 80%,
                      rgba(0,0,0,0.3) 100%
                    )
                  `,
                  borderRadius: '0 0 45% 45%',
                  pointerEvents: 'none',
                  zIndex: 3
                }} />
                
                {/* Natural bamboo grain highlights */}
                <div style={{
                  position: 'absolute',
                  top: '15%',
                  left: '20%',
                  width: '60%',
                  height: '20%',
                  background: `
                    radial-gradient(ellipse 60% 30% at center top, 
                      rgba(222, 184, 135, 0.4) 0%, 
                      rgba(210, 180, 140, 0.3) 40%,
                      rgba(205, 133, 63, 0.2) 70%,
                      transparent 100%
                    )
                  `,
                  borderRadius: '40% 40% 15% 15%',
                  pointerEvents: 'none',
                  zIndex: 4
                }} />
                
                {/* Natural bamboo node marks */}
                {Array.from({ length: 2 }, (_, i) => (
                  <div
                    key={`node-${i}`}
                    style={{
                      position: 'absolute',
                      left: (25 + i * 30) + '%',
                      top: (40 + i * 20) + '%',
                      width: getResponsiveValue(2, 3, 4) + 'px',
                      height: getResponsiveValue(1, 2, 3) + 'px',
                      background: 'rgba(101, 67, 33, 0.6)',
                      borderRadius: '50%',
                      zIndex: 6,
                      boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.4)'
                    }}
                  />
                ))}
                
                {/* Natural texture overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    repeating-linear-gradient(45deg,
                      transparent 0px,
                      rgba(101, 67, 33, 0.03) 1px,
                      transparent 2px,
                      rgba(139, 115, 85, 0.02) 3px,
                      transparent 4px
                    )
                  `,
                  pointerEvents: 'none',
                  zIndex: 7,
                  borderRadius: '6px 6px 55% 55%'
                }} />
                
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Message */}
        {showMessage && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(1)',
            fontSize: fontSizes.message + 'px',
            fontWeight: 'bold',
            padding: getResponsiveValue(15, 20, 25) + 'px ' + getResponsiveValue(20, 30, 40) + 'px',
            borderRadius: getResponsiveValue(15, 18, 20) + 'px',
            textAlign: 'center',
            zIndex: 1000,
            fontFamily: "'Fredoka One', cursive",
            background: messageType === 'correct' ? 
              'linear-gradient(45deg, #27ae60, #2ecc71)' : 
              'linear-gradient(45deg, #e74c3c, #c0392b)',
            color: 'white',
            boxShadow: messageType === 'correct' ?
              '0 10px 30px rgba(39, 174, 96, 0.4)' :
              '0 10px 30px rgba(231, 76, 60, 0.4)',
            maxWidth: 'calc(100vw - 40px)',
            wordWrap: 'break-word',
            lineHeight: '1.2',
            boxSizing: 'border-box'
          }}>
            {messageText}
          </div>
        )}

        {/* Responsive Game Over */}
        {showGameOver && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'white',
            fontSize: fontSizes.gameOver + 'px',
            zIndex: 1000,
            fontFamily: "'Fredoka One', cursive",
            backdropFilter: 'blur(10px)',
            padding: padding + 'px',
            boxSizing: 'border-box'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: getResponsiveValue(20, 30, 40) + 'px',
              borderRadius: borderRadius + 'px',
              textAlign: 'center',
              maxWidth: 'calc(100vw - 40px)',
              boxSizing: 'border-box'
            }}>
              <div style={{ marginBottom: '20px', wordWrap: 'break-word' }}>🎮 Game Over! 🎮</div>
              <div style={{ marginBottom: '25px', wordWrap: 'break-word' }}>🏆 Final Score: {score} 🏆</div>
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={gameHandlers.restartGame}
                  style={{
                    padding: getResponsiveValue(12, 15, 20) + 'px ' + getResponsiveValue(20, 30, 40) + 'px',
                    fontSize: getResponsiveValue(14, 16, 20) + 'px',
                    background: 'linear-gradient(45deg, #27ae60, #2ecc71)',
                    color: 'white',
                    border: 'none',
                    borderRadius: getResponsiveValue(12, 15, 15) + 'px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: "'Fredoka One', cursive",
                    boxShadow: '0 8px 20px rgba(39, 174, 96, 0.4)',
                    minHeight: '44px',
                    minWidth: '44px',
                    touchAction: 'manipulation'
                  }}
                >
                  🚀 Play Again
                </button>
                
           
              </div>
            </div>
          </div>
        )}

        {/* Responsive Instructions */}
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
            padding: padding + 'px',
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: getResponsiveValue(20, 30, 40) + 'px', 
              borderRadius: borderRadius + 'px', 
              backdropFilter: 'blur(10px)',
              maxWidth: Math.min(500, screenSize.width - 40) + 'px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxSizing: 'border-box'
            }}>
              <h2 style={{ 
                marginBottom: '20px', 
                color: '#ffd700', 
                fontSize: getResponsiveValue(18, 20, 24) + 'px',
                wordWrap: 'break-word'
              }}>🧺 Quiz Basket Game 🧺</h2>
              
              <div style={{ fontSize: getResponsiveValue(12, 14, 16) + 'px', lineHeight: '1.4' }}>
                <p style={{ marginBottom: '12px' }}>📚 Questions from static database!</p>
                <p style={{ marginBottom: '12px' }}>🔄 Shuffle for variety!</p>
                <p style={{ marginBottom: '12px' }}>🖱️ Move your mouse to control the basket</p>
                <p style={{ marginBottom: '12px' }}>📱 On mobile, touch and drag to move</p>
                <p style={{ marginBottom: '12px' }}>⬅️➡️ Or use arrow keys to move left/right</p>
                <p style={{ marginBottom: '12px' }}>🎯 Catch the fruit with the correct answer</p>
                <p style={{ marginBottom: '12px' }}>❌ Wrong answers cost you a life!</p>
                <p style={{ marginBottom: '12px' }}>💖 Game ends when you run out of lives!</p>
                <p style={{ marginBottom: '12px' }}>🔄 Choose categories or shuffle questions!</p>
                <p style={{ marginBottom: '12px' }}>⏰ If you miss a fruit, you lose a life!</p>
                <p style={{ marginBottom: '15px', fontSize: getResponsiveValue(10, 12, 14) + 'px', color: '#ffd700' }}>
                  🔍 Fruits resize based on answer length!
                </p>
              </div>
              
              <button 
                onClick={() => gameHandlers.setShowInstructions(false)}
                style={{
                  padding: getResponsiveValue(10, 12, 15) + 'px ' + getResponsiveValue(20, 25, 30) + 'px',
                  fontSize: getResponsiveValue(12, 14, 18) + 'px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: getResponsiveValue(8, 10, 10) + 'px',
                  cursor: 'pointer',
                  fontFamily: "'Fredoka One', cursive",
                  marginTop: '20px',
                  minHeight: '44px',
                  minWidth: '44px',
                  touchAction: 'manipulation'
                }}
              >
                🚀 Start Playing!
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EXACT ORIGINAL CSS Animations */}
      <style jsx>{`
        @keyframes rainbowShift {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 100%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
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

        .fruit {
          position: absolute;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
          text-align: center;
          padding: ${getResponsiveValue(4, 5, 6)}px;
          font-family: 'Fredoka One', cursive;
          border: ${getResponsiveValue(2, 3, 4)}px solid rgba(255, 255, 255, 0.6);
          z-index: 10;
          top: -100px;
          transform: translateZ(0);
          backface-visibility: hidden;
          max-width: calc(100vw - ${getResponsiveValue(40, 60, 80)}px);
          box-sizing: border-box;
          word-wrap: break-word;
          overflow-wrap: break-word;
          pointer-events: none !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          touch-action: none !important;
          -webkit-touch-callout: none !important;
          -webkit-user-drag: none !important;
          -webkit-tap-highlight-color: transparent !important;
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

        .catch-effect {
          position: absolute;
          width: ${getResponsiveValue(20, 25, 30)}px;
          height: ${getResponsiveValue(20, 25, 30)}px;
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
            transform: scale(3) rotate(360deg);
            opacity: 0;
          }
        }

        @media screen and (max-width: 480px) {
          .fruit {
            font-size: ${getResponsiveValue(8, 10, 12)}px !important;
            padding: 3px !important;
            border-width: 2px !important;
          }
        }

        @media screen and (max-width: 320px) {
          .fruit {
            font-size: 7px !important;
            padding: 2px !important;
            border-width: 1px !important;
            max-width: calc(100vw - 20px) !important;
          }
        }

        @media screen and (orientation: landscape) and (max-height: 500px) {
          .fruit {
            font-size: ${getResponsiveValue(7, 9, 11)}px !important;
          }
        }

        @media screen and (-webkit-min-device-pixel-ratio: 2) {
          .fruit {
            border-width: ${Math.max(1, getResponsiveValue(1, 2, 3))}px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        * {
          max-width: 100vw;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default GameUI;