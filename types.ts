export enum GameStage {
  Infant = 'Infant (0-1 yr)',
  Toddler = 'Toddler (1-3 yrs)',
  Preschool = 'Preschool (3-6 yrs)',
  Elementary = 'Elementary (6-12 yrs)',
  Teen = 'Teenager (13-18 yrs)',
  Adult = 'Young Adult (18+ yrs)'
}

export interface PlayerStats {
  bonding: number;    // 亲密关系
  resilience: number; // 抗压/韧性
  confidence: number; // 自信/独立
}

export interface GameState {
  playerName: string;
  childName: string;
  childGender: 'boy' | 'girl';
  age: number; // in years
  stage: GameStage;
  stats: PlayerStats;
  history: string[]; // Summary of past key events
  isGameOver: boolean;
}

export interface Choice {
  id: string;
  text: string;
  style: 'Authoritative' | 'Authoritarian' | 'Permissive' | 'Neglectful' | 'Empathetic';
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  childDialogue?: string; // What the child actually says
  emotion?: string; // The emotion associated with the dialogue
  context: string; // Internal context for AI
  choices: Choice[];
  imageUrl?: string; // Placeholder URL
}

export interface Outcome {
  narrative: string; // Story progression
  childDialogue?: string; // Child's verbal reaction
  emotion?: string; // Emotion of the reaction
  feedback: string; // Expert parenting advice/analysis
  statChanges: {
    bonding: number;
    resilience: number;
    confidence: number;
  };
  childReaction: string; // E.g., "Tommy looks away..."
}