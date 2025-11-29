import React from 'react';
import { Outcome, Scenario } from '../types';
import { ArrowRight, Star, TrendingUp, TrendingDown } from 'lucide-react';

interface FeedbackViewProps {
  outcome: Outcome;
  previousScenario: Scenario;
  onNext: () => void;
}

const StatChangeBadge: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold mr-2 mb-2
      ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
      {label} {isPositive ? '+' : ''}{value}
    </span>
  );
};

export const FeedbackView: React.FC<FeedbackViewProps> = ({ outcome, previousScenario, onNext }) => {
  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-warm-200 overflow-hidden">
        <div className="bg-warm-50 p-6 border-b border-warm-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Outcome</h3>
           <div className="flex flex-wrap">
             <StatChangeBadge label="Bonding" value={outcome.statChanges.bonding} />
             <StatChangeBadge label="Resilience" value={outcome.statChanges.resilience} />
             <StatChangeBadge label="Confidence" value={outcome.statChanges.confidence} />
           </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg italic text-gray-600 border-l-4 border-warm-300">
            "{outcome.childReaction}"
          </div>
          
          <div className="text-gray-800 leading-relaxed">
            {outcome.narrative}
          </div>

          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
             <div className="flex items-center text-indigo-800 mb-2 font-semibold">
               <Star size={18} className="mr-2 fill-current" />
               <span>Parenting Insight</span>
             </div>
             <p className="text-indigo-900 text-sm leading-relaxed">
               {outcome.feedback}
             </p>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-warm-600 hover:bg-warm-700 text-white font-bold py-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
          >
            <span>Continue Growing</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};