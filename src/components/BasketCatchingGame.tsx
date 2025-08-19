'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SoundManager } from './sounds';
import { questions, Question, getRandomQuestions, getQuestionsByCategory } from './questions';
import GameUI from './GameUI';

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

// Extend Window interface to include custom properties
declare global {
  interface Window {
    resizeTimeout?: NodeJS.Timeout;
  }
}

const GameLogic: React.FC = () => {
  // Hydration state
  const [isClient, setIsClient] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameRunning, setGameRunning] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [basketPosition, setBasketPosition] = useState(50);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'correct' | 'wrong'>('correct');
  const [showGameOver, setShowGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Static Question state
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('Math');

  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  const fruitsRef = useRef<Fruit[]>([]);
  const messageTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const keysPressed = useRef<KeysPressed>({ left: false, right: false });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const soundManagerRef = useRef<SoundManager | null>(null);
  const hasSpawnedForQuestionRef = useRef<number>(-1); // NEW: Track spawning state
  
  // Touch handling refs
  const touchStateRef = useRef<{
    isActive: boolean;
    targetPosition: number;
    smoothingFactor: number;
  }>({
    isActive: false,
    targetPosition: 50,
    smoothingFactor: 0.2
  });

  const fruitTypes = ['apple', 'orange', 'banana', 'grape'];

  // Initialize questions on component mount
  useEffect(() => {
    if (isClient) {
      loadQuestions(currentCategory);
    }
  }, [isClient, currentCategory]);

  // Load questions by category
  const loadQuestions = (category: string) => {
    let categoryQuestions = getQuestionsByCategory(category);
    
    // If no questions for specific category, get random questions
    if (categoryQuestions.length === 0) {
      categoryQuestions = getRandomQuestions(15);
    }
    
    // Shuffle and take up to 15 questions
    const shuffledQuestions = getRandomQuestions(Math.min(15, categoryQuestions.length));
    setGameQuestions(shuffledQuestions);
    setCurrentQuestion(0);
    setQuestionAnswered(false);
    hasSpawnedForQuestionRef.current = -1; // Reset spawn tracking when loading new questions
    
    // Auto-start game if it was running
    if (gameRunning || !showInstructions) {
      setTimeout(() => {
        setGameRunning(true);
      }, 500);
    }
  };

  // Generate new questions for a category
  const generateNewQuestions = (category: string = 'Math') => {
    console.log(`🔄 Loading fresh ${category} questions`);
    setCurrentCategory(category);
    loadQuestions(category);
  };

  // Get current question from static questions
  const getCurrentQuestion = (): Question | null => {
    if (gameQuestions.length === 0) return null;
    return gameQuestions[currentQuestion % gameQuestions.length];
  };

  // Enhanced responsive sizing functions
  const getResponsiveValue = useCallback((mobile: number, tablet: number, desktop: number) => {
    if (screenSize.width <= 480) return mobile;
    if (screenSize.width <= 768) return mobile * 1.1;
    if (screenSize.width <= 1024) return tablet;
    return desktop;
  }, [screenSize.width]);

  const getBasketSize = useCallback(() => {
    if (isLandscape && screenSize.height < 500) {
      return { 
        width: Math.max(40, Math.min(70, screenSize.width * 0.08)), 
        height: Math.max(20, Math.min(35, screenSize.height * 0.08)) 
      };
    }
    
    if (isMobile) {
      if (screenSize.width <= 320) {
        return { width: 50, height: 25 };
      } else if (screenSize.width <= 480) {
        return { width: 60, height: 30 };
      } else {
        return { width: 80, height: 40 };
      }
    }
    
    return { 
      width: isLandscape ? Math.min(100, screenSize.width * 0.08) : Math.min(120, screenSize.width * 0.1), 
      height: isLandscape ? Math.min(55, screenSize.height * 0.08) : Math.min(60, screenSize.height * 0.08) 
    };
  }, [isLandscape, isMobile, screenSize]);

  const getFontSizes = useCallback(() => {
    const baseSize = Math.max(10, Math.min(16, screenSize.width * 0.025));
    return {
      question: isLandscape ? baseSize * 0.9 : baseSize * 1.2,
      stats: isLandscape ? baseSize * 0.7 : baseSize * 0.9,
      message: isLandscape ? baseSize * 1.1 : baseSize * 1.4,
      gameOver: isLandscape ? baseSize * 1.0 : baseSize * 1.3,
      instruction: isLandscape ? baseSize * 0.6 : baseSize * 0.8
    };
  }, [screenSize.width, screenSize.height, isLandscape]);

  // Enhanced responsive breakpoint detection
  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscapeOrientation = width > height && (width >= 768 || (width >= 600 && height <= 500));
      const isMobileDevice = width <= 768 || ('ontouchstart' in window && width <= 1024);
      
      setScreenSize({ width, height });
      setIsLandscape(isLandscapeOrientation);
      setIsMobile(isMobileDevice);
      
      // Adjust touch sensitivity based on screen size
      touchStateRef.current.smoothingFactor = isMobileDevice ? 
        (width <= 480 ? 0.25 : 0.2) : 0.15;
    };

    updateScreenInfo();
    
    const handleResize = () => {
      // Debounce resize events
      if (window.resizeTimeout) {
        clearTimeout(window.resizeTimeout);
      }
      window.resizeTimeout = setTimeout(updateScreenInfo, 100);
    };
    
    const handleOrientationChange = () => {
      // Handle orientation change with delay for mobile browsers
      setTimeout(updateScreenInfo, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.resizeTimeout) {
        clearTimeout(window.resizeTimeout);
      }
    };
  }, []);

  // Initialize sound manager with better error handling
  useEffect(() => {
    if (isClient) {
      soundManagerRef.current = new SoundManager();
      
      const handleFirstInteraction = async () => {
        try {
          if (soundManagerRef.current) {
            await soundManagerRef.current.play('catch');
          }
        } catch (error) {
          console.log('Sound initialization failed:', error);
        }
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      };
      
      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('touchstart', handleFirstInteraction);
      
      return () => {
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      };
    }
  }, [isClient]);

  // Enhanced responsive fruit size calculation
  const calculateFruitSize = (text: string): number => {
    const baseSize = getResponsiveValue(35, 50, 65);
    const maxSize = getResponsiveValue(70, 90, 120);
    const maxLength = 25;
    const textLength = text.length;
    
    // Scale size based on text length and screen constraints
    const sizeFactor = Math.min(textLength / maxLength, 1);
    let calculatedSize = baseSize + (sizeFactor * (maxSize - baseSize));
    
    // Additional constraints for very small screens
    if (screenSize.width <= 320) {
      calculatedSize = Math.min(calculatedSize, 55);
    } else if (screenSize.width <= 480) {
      calculatedSize = Math.min(calculatedSize, 70);
    }
    
    // Ensure minimum readable size
    return Math.max(baseSize, Math.min(maxSize, calculatedSize));
  };

  const calculateFontSize = (fruitSize: number, textLength: number): number => {
    const baseFontSize = getResponsiveValue(6, 8, 10);
    const maxFontSize = getResponsiveValue(10, 12, 14);
    
    let fontSize;
    if (textLength <= 2) {
      fontSize = Math.min(maxFontSize, fruitSize / 4);
    } else if (textLength <= 5) {
      fontSize = Math.min(maxFontSize * 0.9, fruitSize / 5);
    } else if (textLength <= 10) {
      fontSize = Math.min(maxFontSize * 0.8, fruitSize / 6);
    } else {
      fontSize = Math.max(baseFontSize, fruitSize / 8);
    }
    
    // Additional constraints for very small screens
    if (screenSize.width <= 320) {
      fontSize = Math.min(fontSize, 8);
    } else if (screenSize.width <= 480) {
      fontSize = Math.min(fontSize, 10);
    }
    
    return Math.max(baseFontSize, fontSize);
  };

  // Enhanced catch effect with responsive sizing
  const createCatchEffect = (x: number, y: number) => {
    if (!gameAreaRef.current) return;
    
    soundManagerRef.current?.play('catch');
    
    const effectCount = getResponsiveValue(4, 6, 8);
    const effectSize = getResponsiveValue(12, 16, 20);
    
    for (let i = 0; i < effectCount; i++) {
      const effect = document.createElement('div');
      effect.className = 'catch-effect';
      effect.style.left = x + (Math.random() - 0.5) * 60 + 'px';
      effect.style.top = y + (Math.random() - 0.5) * 60 + 'px';
      effect.style.width = effectSize + 'px';
      effect.style.height = effectSize + 'px';
      effect.style.animationDelay = i * 0.04 + 's';
      gameAreaRef.current.appendChild(effect);
      
      setTimeout(() => {
        if (effect.parentNode) {
          effect.remove();
        }
      }, 1200);
    }
  };

  const displayMessage = (text: string, type: 'correct' | 'wrong') => {
    setMessageText(text);
    setMessageType(type);
    setShowMessage(true);
    
    soundManagerRef.current?.play(type);
    
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
    }, isMobile ? 2000 : 2200);
  };

  // Enhanced basket position update with bounds checking
  const updateBasketPosition = useCallback(() => {
    if (!gameAreaRef.current || !basketRef.current) return;
    
    const basketSize = getBasketSize();
    const gameAreaWidth = gameAreaRef.current.offsetWidth;
    const maxLeft = Math.max(0, gameAreaWidth - basketSize.width);
    const leftPosition = Math.max(0, Math.min(maxLeft, (basketPosition / 100) * maxLeft));
    
    basketRef.current.style.left = leftPosition + 'px';
    basketRef.current.style.width = basketSize.width + 'px';
    basketRef.current.style.height = basketSize.height + 'px';
  }, [basketPosition, getBasketSize]);

  // Enhanced fruit spawning with better positioning and double spawn prevention
  const spawnAllFruits = useCallback(() => {
    if (!gameRunning || questionAnswered || fruitsRef.current.length > 0 || !gameAreaRef.current || gameQuestions.length === 0) {
      return;
    }

    const q = getCurrentQuestion();
    if (!q) return;

    // Additional safety check to prevent double spawning
    if (document.querySelectorAll('.fruit').length > 0) {
      console.log('⚠️ Fruits already in DOM, preventing double spawn');
      return;
    }

    console.log('🍎 Spawning fruits for question:', currentQuestion);
    soundManagerRef.current?.play('spawn');

    const gameAreaWidth = gameAreaRef.current.offsetWidth;
    const sectionWidth = gameAreaWidth / 4;
    const padding = getResponsiveValue(3, 6, 10);

    // Clear existing fruits
    fruitsRef.current.forEach(fruit => {
      if (fruit.element && fruit.element.parentNode) {
        fruit.element.remove();
      }
    });
    fruitsRef.current = [];

    q.answers.forEach((answer, index) => {
      const fruit = document.createElement('div');
      const fruitSize = calculateFruitSize(answer);
      const fontSize = calculateFontSize(fruitSize, answer.length);
      
      fruit.className = `fruit ${fruitTypes[index]}`;
      fruit.textContent = answer;
      
      // Enhanced responsive styling
      fruit.style.width = fruitSize + 'px';
      fruit.style.height = fruitSize + 'px';
      fruit.style.fontSize = fontSize + 'px';
      fruit.style.lineHeight = '1.1';
      fruit.style.display = 'flex';
      fruit.style.alignItems = 'center';
      fruit.style.justifyContent = 'center';
      fruit.style.textAlign = 'center';
      fruit.style.wordWrap = 'break-word';
      fruit.style.overflowWrap = 'break-word';
      fruit.style.hyphens = 'auto';
      fruit.style.maxWidth = Math.min(fruitSize, (gameAreaWidth / 4) - (padding * 2)) + 'px';
      
      // Enhanced positioning with collision avoidance
      const xPosition = (index * sectionWidth) + (sectionWidth / 2) - (fruitSize / 2);
      const fruitLeft = Math.max(padding, Math.min(gameAreaWidth - fruitSize - padding, xPosition));
      
      fruit.style.left = fruitLeft + 'px';
      fruit.style.position = 'absolute';
      fruit.style.top = '-120px';
      
      // Enhanced interaction prevention with proper type casting
      fruit.style.pointerEvents = 'none';
      fruit.style.userSelect = 'none';
      (fruit.style as any).webkitUserSelect = 'none';
      fruit.style.touchAction = 'none';
      (fruit.style as any).webkitTouchCallout = 'none';
      (fruit.style as any).webkitUserDrag = 'none';
      (fruit.style as any).MozUserSelect = 'none';
      (fruit.style as any).msUserSelect = 'none';
      
      gameAreaRef.current!.appendChild(fruit);
      fruitsRef.current.push({
        element: fruit,
        correct: (answer === q.correctAnswer),
        y: -fruitSize - 30,
        x: fruitLeft,
        speed: getResponsiveValue(1.0, 1.3, 1.6) + Math.random() * 0.2,
        size: fruitSize
      });
    });

    console.log(`✅ Spawned ${fruitsRef.current.length} fruits`);
  }, [gameRunning, questionAnswered, gameQuestions.length, currentQuestion, getResponsiveValue, calculateFruitSize, calculateFontSize]);

  // Enhanced collision detection with better accuracy
  const checkCollisions = useCallback(() => {
    if (!basketRef.current || !gameAreaRef.current) return;

    const basketRect = basketRef.current.getBoundingClientRect();
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    
    fruitsRef.current.forEach((fruit) => {
      const fruitRect = fruit.element.getBoundingClientRect();
      
      // Enhanced collision detection with overlap threshold
      const overlapThreshold = isMobile ? 0.6 : 0.7;
      const basketCenterX = basketRect.left + basketRect.width / 2;
      const fruitCenterX = fruitRect.left + fruitRect.width / 2;
      const horizontalDistance = Math.abs(basketCenterX - fruitCenterX);
      const maxHorizontalDistance = (basketRect.width + fruitRect.width) / 2 * overlapThreshold;
      
      if (fruitRect.bottom >= basketRect.top && 
          fruitRect.top <= basketRect.bottom &&
          horizontalDistance <= maxHorizontalDistance) {
        
        // Calculate effect position relative to game area
        const effectX = fruitRect.left - gameAreaRect.left;
        const effectY = fruitRect.top - gameAreaRect.top;
        createCatchEffect(effectX, effectY);
        
        if (fruit.correct) {
          setScore(prev => prev + 10);
          displayMessage('🎉 Perfect Catch! +10 points! 🎉', 'correct');
        } else {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameRunning(false);
              setTimeout(() => setShowGameOver(true), 300);
            }
            return newLives;
          });
          displayMessage('❌ Wrong answer! -1 life! ❌', 'wrong');
        }
        
        setQuestionAnswered(true);
        
        // Clear all fruits
        fruitsRef.current.forEach(f => {
          if (f.element && f.element.parentNode) {
            f.element.remove();
          }
        });
        fruitsRef.current = [];
        
        // Move to next question
        setTimeout(() => {
          setCurrentQuestion(prev => (prev + 1) % gameQuestions.length);
          setQuestionAnswered(false);
          hasSpawnedForQuestionRef.current = -1; // Reset spawn tracking when moving to next question
        }, 800);
      }
    });
  }, [gameQuestions.length, isMobile]);

  const handleFruitMissed = useCallback(() => {
    // This function is called when a fruit (especially correct answers) falls off screen
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameRunning(false);
        setTimeout(() => setShowGameOver(true), 300);
      }
      return newLives;
    });
    displayMessage('💔 Missed the correct answer! ', 'wrong');
  }, []);

  // Enhanced game loop with better performance
  const gameLoop = useCallback(() => {
    if (!gameRunning) {
      if (animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
      return;
    }
    
    const moveSpeed = getResponsiveValue(1.2, 1.5, 2.0);
    
    // Keyboard movement
    if (keysPressed.current.left) {
      setBasketPosition(prev => Math.max(0, prev - moveSpeed));
    }
    if (keysPressed.current.right) {
      setBasketPosition(prev => Math.min(100, prev + moveSpeed));
    }
    
    // Touch movement with enhanced smoothing
    if (touchStateRef.current.isActive) {
      setBasketPosition(prev => {
        const diff = touchStateRef.current.targetPosition - prev;
        const smoothing = Math.min(touchStateRef.current.smoothingFactor, Math.abs(diff) * 0.1);
        return prev + (diff * smoothing);
      });
    }
    
    // Enhanced fruit movement with bounds checking
    fruitsRef.current.forEach((fruit, index) => {
      fruit.y += fruit.speed;
      
      if (fruit.element && fruit.element.parentNode) {
        fruit.element.style.transform = `translateY(${fruit.y}px)`;
        
        // Remove fruits that fall off screen
        if (fruit.y > (gameAreaRef.current?.offsetHeight || 0) + fruit.size + 100) {
          fruit.element.remove();
          fruitsRef.current.splice(index, 1);
        }
      }
    });
    
    // REMOVED THE AUTOMATIC RESPAWN LOGIC - This was causing double spawning
    // The useEffect will handle spawning when needed
    
    checkCollisions();
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameRunning, checkCollisions, getResponsiveValue]);

  const restartGame = () => {
    setGameRunning(true);
    setScore(0);
    setLives(3);
    setCurrentQuestion(0);
    setQuestionAnswered(false);
    setBasketPosition(50);
    setShowGameOver(false);
    setShowMessage(false);
    hasSpawnedForQuestionRef.current = -1; // Reset spawn tracking on restart
    
    touchStateRef.current = {
      isActive: false,
      targetPosition: 50,
      smoothingFactor: isMobile ? 0.2 : 0.15
    };
    
    // Clear existing fruits
    fruitsRef.current.forEach(fruit => {
      if (fruit.element && fruit.element.parentNode) {
        fruit.element.remove();
      }
    });
    fruitsRef.current = [];
  };

  // Shuffle current category questions
  const shuffleQuestions = () => {
    console.log('🔄 Shuffling questions for variety...');
    loadQuestions(currentCategory);
  };

  // Enhanced touch handlers with better responsiveness
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!gameRunning || !gameAreaRef.current) return;
    
    const touch = e.touches[0];
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const touchX = touch.clientX - gameAreaRect.left;
    const newPosition = (touchX / gameAreaRect.width) * 100;
    
    touchStateRef.current = {
      isActive: true,
      targetPosition: Math.max(5, Math.min(95, newPosition)),
      smoothingFactor: screenSize.width <= 480 ? 0.25 : 0.2
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!gameRunning || !gameAreaRef.current || !touchStateRef.current.isActive) return;
    
    const touch = e.touches[0];
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const touchX = touch.clientX - gameAreaRect.left;
    const newPosition = (touchX / gameAreaRect.width) * 100;
    
    touchStateRef.current.targetPosition = Math.max(5, Math.min(95, newPosition));
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    touchStateRef.current.isActive = false;
  };

  // Enhanced mouse movement for desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameRunning || !gameAreaRef.current || isMobile) return;
    
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const mouseX = e.clientX - gameAreaRect.left;
    const newPosition = (mouseX / gameAreaRef.current.offsetWidth) * 100;
    
    setBasketPosition(Math.max(5, Math.min(95, newPosition)));
  };

  // Effects with enhanced cleanup
  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => setShowInstructions(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isClient) {
      updateBasketPosition();
    }
  }, [basketPosition, updateBasketPosition, isClient]);

  // FIXED useEffect - prevents multiple spawns per question
  useEffect(() => {
    if (!questionAnswered && 
        gameRunning && 
        isClient && 
        fruitsRef.current.length === 0 && 
        gameQuestions.length > 0 && 
        hasSpawnedForQuestionRef.current !== currentQuestion) {
      
      hasSpawnedForQuestionRef.current = currentQuestion;
      
      const timer = setTimeout(() => {
        if (fruitsRef.current.length === 0 && gameRunning && !questionAnswered) {
          spawnAllFruits();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, questionAnswered, gameRunning, isClient]);

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

  // Enhanced keyboard handlers with better responsiveness
  useEffect(() => {
    if (!isClient) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRunning) return;
      
      e.preventDefault();
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameRunning, isClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clear any remaining fruits
      fruitsRef.current.forEach(fruit => {
        if (fruit.element && fruit.element.parentNode) {
          fruit.element.remove();
        }
      });
      fruitsRef.current = [];
    };
  }, []);

  if (!isClient) {
    return null;
  }

  const currentQuestionData = getCurrentQuestion();

  // Enhanced game handlers object with better organization
  const gameHandlers = {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseMove,
    handleFruitMissed,
    generateNewQuestions,
    shuffleQuestions,
    restartGame,
    setShowInstructions
  };

  return (
    <GameUI
      // Game state props
      isClient={isClient}
      isLandscape={isLandscape}
      isMobile={isMobile}
      screenSize={screenSize}
      currentQuestion={currentQuestion}
      score={score}
      lives={lives}
      gameRunning={gameRunning}
      questionAnswered={questionAnswered}
      basketPosition={basketPosition}
      showMessage={showMessage}
      messageText={messageText}
      messageType={messageType}
      showGameOver={showGameOver}
      showInstructions={showInstructions}
      gameQuestions={gameQuestions}
      currentCategory={currentCategory}
      currentQuestionData={currentQuestionData}
      
      // Refs
      gameAreaRef={gameAreaRef}
      basketRef={basketRef}
      
      // Utility functions
      getResponsiveValue={getResponsiveValue}
      getBasketSize={getBasketSize}
      getFontSizes={getFontSizes}
      
      // Handlers
      gameHandlers={gameHandlers}
    />
  );
};

export default GameLogic;