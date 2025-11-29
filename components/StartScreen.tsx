import React, { useState } from 'react';
import { GameState, GameStage } from '../types';
import { INITIAL_STATS } from '../constants';

interface StartScreenProps {
  onStart: (initialState: Partial<GameState>) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [childGender, setChildGender] = useState<'boy' | 'girl'>('boy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !childName) return;

    onStart({
      playerName: parentName,
      childName: childName,
      childGender: childGender,
      age: 0,
      stage: GameStage.Infant,
      stats: INITIAL_STATS,
      history: [],
      isGameOver: false,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-warm-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-warm-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Growing Together</h1>
          <p className="text-warm-100">A Parenting Simulation Journey</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How should we call you?</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-warm-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none transition"
              placeholder="e.g. Mom, Dad, Alex"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child's Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-warm-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none transition"
              placeholder="e.g. Charlie"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Child's Gender</label>
             <div className="flex space-x-4">
               <button
                 type="button"
                 onClick={() => setChildGender('boy')}
                 className={`flex-1 py-2 rounded-lg border transition ${childGender === 'boy' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
               >
                 Boy
               </button>
               <button
                 type="button"
                 onClick={() => setChildGender('girl')}
                 className={`flex-1 py-2 rounded-lg border transition ${childGender === 'girl' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
               >
                 Girl
               </button>
             </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-warm-600 hover:bg-warm-700 text-white font-semibold py-3 rounded-lg shadow-md transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Journey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};