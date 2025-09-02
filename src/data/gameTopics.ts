export interface GameTopic {
  id: string;
  title: string;
  subject: 'physics' | 'chemistry' | 'biology' | 'math';
  grade: 9 | 10;
  gameType: 'quiz' | 'drag-drop' | 'memory' | 'puzzle' | 'simulation';
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  icon: string;
  color: string;
  questions?: any[];
  gameData?: any;
}

export const ninthGradeTopics: GameTopic[] = [
  // Physics
  {
    id: 'physics-motion-9',
    title: 'Motion & Speed',
    subject: 'physics',
    grade: 9,
    gameType: 'simulation',
    difficulty: 'medium',
    description: 'Learn about motion, velocity, and acceleration through interactive simulations',
    icon: '🚗',
    color: '#3B82F6',
    gameData: {
      scenarios: ['car_race', 'ball_drop', 'rocket_launch']
    }
  },
  {
    id: 'physics-force-9',
    title: 'Force & Laws of Motion',
    subject: 'physics',
    grade: 9,
    gameType: 'drag-drop',
    difficulty: 'medium',
    description: 'Understand Newton\'s laws through interactive experiments',
    icon: '⚖️',
    color: '#3B82F6'
  },
  
  // Chemistry
  {
    id: 'chemistry-atoms-9',
    title: 'Atoms & Molecules',
    subject: 'chemistry',
    grade: 9,
    gameType: 'memory',
    difficulty: 'easy',
    description: 'Match elements with their properties and atomic structures',
    icon: '⚛️',
    color: '#10B981'
  },
  {
    id: 'chemistry-reactions-9',
    title: 'Chemical Reactions',
    subject: 'chemistry',
    grade: 9,
    gameType: 'puzzle',
    difficulty: 'hard',
    description: 'Balance chemical equations and predict reaction outcomes',
    icon: '🧪',
    color: '#10B981'
  },

  // Biology
  {
    id: 'biology-cells-9',
    title: 'Cell Structure',
    subject: 'biology',
    grade: 9,
    gameType: 'drag-drop',
    difficulty: 'easy',
    description: 'Identify and place cell organelles in their correct positions',
    icon: '🔬',
    color: '#8B5CF6'
  },
  {
    id: 'biology-tissues-9',
    title: 'Tissues & Organs',
    subject: 'biology',
    grade: 9,
    gameType: 'quiz',
    difficulty: 'medium',
    description: 'Learn about different types of tissues and organ systems',
    icon: '🫀',
    color: '#8B5CF6'
  },

  // Math
  {
    id: 'math-algebra-9',
    title: 'Algebraic Expressions',
    subject: 'math',
    grade: 9,
    gameType: 'puzzle',
    difficulty: 'medium',
    description: 'Solve algebraic equations and simplify expressions',
    icon: '📐',
    color: '#F59E0B'
  },
  {
    id: 'math-geometry-9',
    title: 'Geometry Basics',
    subject: 'math',
    grade: 9,
    gameType: 'simulation',
    difficulty: 'easy',
    description: 'Explore shapes, angles, and geometric properties',
    icon: '📏',
    color: '#F59E0B'
  }
];

export const tenthGradeTopics: GameTopic[] = [
  // Physics
  {
    id: 'physics-light-10',
    title: 'Light & Reflection',
    subject: 'physics',
    grade: 10,
    gameType: 'simulation',
    difficulty: 'medium',
    description: 'Understand light behavior, mirrors, and lenses',
    icon: '💡',
    color: '#3B82F6'
  },
  {
    id: 'physics-electricity-10',
    title: 'Electricity & Circuits',
    subject: 'physics',
    grade: 10,
    gameType: 'drag-drop',
    difficulty: 'hard',
    description: 'Build circuits and understand electrical concepts',
    icon: '⚡',
    color: '#3B82F6'
  },

  // Chemistry
  {
    id: 'chemistry-acids-10',
    title: 'Acids, Bases & Salts',
    subject: 'chemistry',
    grade: 10,
    gameType: 'quiz',
    difficulty: 'medium',
    description: 'Test pH levels and understand acid-base reactions',
    icon: '🧪',
    color: '#10B981'
  },
  {
    id: 'chemistry-metals-10',
    title: 'Metals & Non-metals',
    subject: 'chemistry',
    grade: 10,
    gameType: 'memory',
    difficulty: 'easy',
    description: 'Classify elements and understand their properties',
    icon: '🔩',
    color: '#10B981'
  },

  // Biology
  {
    id: 'biology-genetics-10',
    title: 'Heredity & Evolution',
    subject: 'biology',
    grade: 10,
    gameType: 'simulation',
    difficulty: 'hard',
    description: 'Explore genetic inheritance and evolutionary concepts',
    icon: '🧬',
    color: '#8B5CF6'
  },
  {
    id: 'biology-reproduction-10',
    title: 'Life Processes',
    subject: 'biology',
    grade: 10,
    gameType: 'drag-drop',
    difficulty: 'medium',
    description: 'Learn about reproduction and life cycles',
    icon: '🌱',
    color: '#8B5CF6'
  },

  // Math
  {
    id: 'math-quadratic-10',
    title: 'Quadratic Equations',
    subject: 'math',
    grade: 10,
    gameType: 'puzzle',
    difficulty: 'hard',
    description: 'Solve quadratic equations using various methods',
    icon: '📊',
    color: '#F59E0B'
  },
  {
    id: 'math-trigonometry-10',
    title: 'Trigonometry',
    subject: 'math',
    grade: 10,
    gameType: 'simulation',
    difficulty: 'medium',
    description: 'Understand trigonometric ratios and applications',
    icon: '📐',
    color: '#F59E0B'
  }
];

export const getAllTopics = () => [...ninthGradeTopics, ...tenthGradeTopics];
export const getTopicsByGrade = (grade: 9 | 10) => 
  grade === 9 ? ninthGradeTopics : tenthGradeTopics;
export const getTopicsBySubject = (subject: string) => 
  getAllTopics().filter(topic => topic.subject === subject);
