import React from 'react';
import { GameState, PlayerStats } from '../types';
import { Heart, Shield, Zap, Clock } from 'lucide-react';

interface DashboardProps {
  gameState: GameState;
}

const StatBar: React.FC<{ icon: React.ReactNode; label: string; value: number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
  <div className="flex flex-col space-y-1">
    <div className="flex justify-between items-center text-xs font-medium text-gray-600">
      <div className="flex items-center space-x-1">
        {icon}
        <span>{label}</span>
      </div>
      <span>{value}%</span>
    </div>
    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ease-out ${colorClass}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ gameState }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-100 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-warm-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{gameState.childName}</h2>
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <Clock size={14} />
            <span>Age: {gameState.age}</span>
            <span className="px-2 py-0.5 rounded-full bg-warm-100 text-warm-800 text-xs font-semibold">
              {gameState.stage}
            </span>
          </div>
        </div>
        <div className="text-right hidden sm:block">
           <p className="text-sm text-gray-400">Parent: {gameState.playerName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBar
          icon={<Heart size={14} className="text-rose-500" />}
          label="Bonding (亲密)"
          value={gameState.stats.bonding}
          colorClass="bg-rose-500"
        />
        <StatBar
          icon={<Shield size={14} className="text-blue-500" />}
          label="Resilience (抗压)"
          value={gameState.stats.resilience}
          colorClass="bg-blue-500"
        />
        <StatBar
          icon={<Zap size={14} className="text-amber-500" />}
          label="Confidence (自信)"
          value={gameState.stats.confidence}
          colorClass="bg-amber-500"
        />
      </div>
    </div>
  );
};