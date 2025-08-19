/**
 * Responsive Question Interface and Data
 * Optimized for mobile, tablet, and desktop displays
 */

export interface Question {
  question: string;
  answers: string[];
  correctAnswer: string;
}

/**
 * Question pool with responsive text lengths
 * Shorter questions and answers work better on mobile devices
 */
export const questions: Question[] = [
  { 
    question: "🍎 What is 2 + 3? 🍎", 
    answers: ["4", "5", "6", "7"], 
    correctAnswer: "5"
  },
  { 
    question: "🌍 Capital of France? 🌍", 
    answers: ["London", "Berlin", "Paris", "Madrid"], 
    correctAnswer: "Paris"
  },
  { 
    question: "🕷️ Spider legs count? 🕷️", 
    answers: ["6", "8", "10", "12"], 
    correctAnswer: "8"
  },
  { 
    question: "🎨 Red + Blue = ? 🎨", 
    answers: ["Green", "Purple", "Orange", "Yellow"], 
    correctAnswer: "Purple"
  },
  { 
    question: "➖ What is 10 - 4? ➖", 
    answers: ["5", "6", "7", "8"], 
    correctAnswer: "6"
  },
  { 
    question: "🐄 Animal that says 'moo'? 🐄", 
    answers: ["Pig", "Cow", "Sheep", "Horse"], 
    correctAnswer: "Cow"
  },
  { 
    question: "📅 Days in a week? 📅", 
    answers: ["5", "6", "7", "8"], 
    correctAnswer: "7"
  },
  { 
    question: "🪐 Largest planet? 🪐", 
    answers: ["Earth", "Jupiter", "Mars", "Venus"], 
    correctAnswer: "Jupiter"
  },
  { 
    question: "🔢 What is 15 ÷ 3? 🔢", 
    answers: ["4", "5", "6", "3"], 
    correctAnswer: "5"
  },
  { 
    question: "🌈 Rainbow colors count? 🌈", 
    answers: ["6", "7", "8", "9"], 
    correctAnswer: "7"
  },
  { 
    question: "🦆 Which can swim? 🦆", 
    answers: ["Cat", "Duck", "Dog", "Bird"], 
    correctAnswer: "Duck"
  },
  { 
    question: "🌙 What comes after day? 🌙", 
    answers: ["Morning", "Night", "Noon", "Evening"], 
    correctAnswer: "Night"
  },
  { 
    question: "🔴 Primary colors include? 🔴", 
    answers: ["Green", "Red", "Pink", "Brown"], 
    correctAnswer: "Red"
  },
  { 
    question: "⚡ Lightning + Thunder = ? ⚡", 
    answers: ["Rain", "Storm", "Snow", "Wind"], 
    correctAnswer: "Storm"
  },
  { 
    question: "🧮 5 × 4 equals? 🧮", 
    answers: ["15", "20", "25", "30"], 
    correctAnswer: "20"
  },
  { 
    question: "🎵 Musical note after G? 🎵", 
    answers: ["A", "H", "F", "B"], 
    correctAnswer: "A"
  },
  { 
    question: "🌡️ Water freezes at? 🌡️", 
    answers: ["0°C", "32°F", "100°C", "Both A&B"], 
    correctAnswer: "Both A&B"
  },
  { 
    question: "🗺️ Continent with Egypt? 🗺️", 
    answers: ["Asia", "Africa", "Europe", "America"], 
    correctAnswer: "Africa"
  },
  { 
    question: "📖 Shakespeare wrote? 📖", 
    answers: ["Novels", "Plays", "Poems", "All Above"], 
    correctAnswer: "All Above"
  },
  { 
    question: "🔬 H2O is formula for? 🔬", 
    answers: ["Air", "Water", "Salt", "Sugar"], 
    correctAnswer: "Water"
  }
];

/**
 * Mobile-optimized question pool for smaller screens
 * These have shorter text and simpler answers
 */
export const mobileQuestions: Question[] = questions;

/**
 * Get questions filtered by category
 */
export const getQuestionsByCategory = (category: string): Question[] => {
  // Since we removed category property, return all questions for any category
  return questions;
};

/**
 * Get a random subset of questions
 */
export const getRandomQuestions = (count: number): Question[] => {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Get questions optimized for specific screen sizes
 */
export const getQuestionsForScreenSize = (screenWidth: number): Question[] => {
  // For very small screens (< 480px), prefer shorter questions
  if (screenWidth < 480) {
    return questions.filter(q => 
      q.question.length <= 30 && 
      q.answers.every(ans => ans.length <= 10)
    );
  }
  
  // For medium screens (480-768px), use mobile optimized questions
  if (screenWidth < 768) {
    return mobileQuestions;
  }
  
  // For larger screens, use all questions
  return questions;
};

/**
 * Categories available in the question pool
 */
export const categories = [
  'Math',
  'Geography',
  'Science',
  'Art',
  'Animals',
  'General',
  'Space',
  'Weather',
  'Music',
  'Chemistry',
  'Literature'
];

/**
 * Get question statistics
 */
export const getQuestionStats = () => {
  return {
    total: questions.length,
    mobileOptimized: mobileQuestions.length
  };
};

/**
 * Validate question format for responsiveness
 */
export const validateQuestion = (question: Question): {
  valid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check question length for mobile compatibility
  if (question.question.length > 50) {
    issues.push('Question text too long for mobile screens');
  }
  
  // Check answer lengths
  const longAnswers = question.answers.filter(ans => ans.length > 15);
  if (longAnswers.length > 0) {
    issues.push(`Answers too long for mobile: ${longAnswers.join(', ')}`);
  }
  
  // Check for emojis (good for visual appeal)
  if (!/[\u{1F300}-\u{1F9FF}]/u.test(question.question)) {
    issues.push('Consider adding emojis for better visual appeal');
  }
  
  // Check correct answer exists in answers array
  if (!question.answers.includes(question.correctAnswer)) {
    issues.push('Correct answer not found in answers array');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

/**
 * Create adaptive question set based on device capabilities
 */
export const createAdaptiveQuestionSet = (
  deviceInfo: {
    screenWidth: number;
    screenHeight: number;
    isTouch: boolean;
    isLandscape: boolean;
  },
  preferredCategory?: string
): Question[] => {
  let baseQuestions = getQuestionsForScreenSize(deviceInfo.screenWidth);
  
  // For landscape orientation on small screens, prefer shorter questions
  if (deviceInfo.isLandscape && deviceInfo.screenHeight < 500) {
    baseQuestions = baseQuestions.filter(q => q.question.length <= 25);
  }
  
  // For touch devices, ensure answers are not too similar (easier touch targeting)
  if (deviceInfo.isTouch) {
    baseQuestions = baseQuestions.filter(q => {
      const answerLengths = q.answers.map(ans => ans.length);
      const maxDiff = Math.max(...answerLengths) - Math.min(...answerLengths);
      return maxDiff <= 8; // Answers should be similar in length for consistent touch targets
    });
  }
  
  return baseQuestions.length > 0 ? baseQuestions : questions; // Fallback to all questions
};

export default questions;
