import React from 'react';
import { Scenario } from '../types';
import { MessageCircle } from 'lucide-react';

interface ScenarioViewProps {
  scenario: Scenario;
  onChoose: (choiceId: string) => void;
  isProcessing: boolean;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({ scenario, onChoose, isProcessing }) => {
  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white rounded-2xl shadow-lg border border-warm-200 overflow-hidden">
        {/* Header/Image Area */}
        <div className="h-32 bg-warm-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
          <div className="absolute bottom-4 left-6">
            <h3 className="text-2xl font-bold text-warm-900">{scenario.title}</h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            {scenario.description}
          </p>
          
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              How do you respond?
            </p>
            {scenario.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onChoose(choice.id)}
                disabled={isProcessing}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group relative
                  ${isProcessing 
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' 
                    : 'border-warm-100 bg-white hover:border-warm-400 hover:bg-warm-50 hover:shadow-md'
                  }`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full mr-4 bg-warm-100 text-warm-600 group-hover:bg-warm-200`}>
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 group-hover:text-warm-900">
                      "{choice.text}"
                    </p>
                    {/* Debug/Educational: Show style on hover or always? Let's hide it to make it a game, reveal later */}
                    {/* <span className="text-xs text-gray-400 mt-1 block">{choice.style}</span> */}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {isProcessing && (
        <div className="flex items-center justify-center p-4 text-warm-600 animate-pulse">
          <span>Consulting parenting experts...</span>
        </div>
      )}
    </div>
  );
};