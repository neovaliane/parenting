import { GameStage } from "./types";

export const INITIAL_STATS = {
  bonding: 50,
  resilience: 30,
  confidence: 30
};

export const STAGE_CONFIG = {
  [GameStage.Infant]: { minAge: 0, maxAge: 1, color: 'bg-pink-200' },
  [GameStage.Toddler]: { minAge: 1, maxAge: 3, color: 'bg-yellow-200' },
  [GameStage.Preschool]: { minAge: 3, maxAge: 6, color: 'bg-green-200' },
  [GameStage.Elementary]: { minAge: 6, maxAge: 12, color: 'bg-blue-200' },
  [GameStage.Teen]: { minAge: 12, maxAge: 18, color: 'bg-purple-200' },
  [GameStage.Adult]: { minAge: 18, maxAge: 99, color: 'bg-slate-200' },
};

export const PLACEHOLDER_IMAGES = {
  infant: 'https://picsum.photos/seed/infant/400/300',
  toddler: 'https://picsum.photos/seed/toddler/400/300',
  school: 'https://picsum.photos/seed/schoolchild/400/300',
  teen: 'https://picsum.photos/seed/teenager/400/300',
};