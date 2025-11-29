import React, { useState } from 'react';
import { Scenario } from '../types';
import { MessageCircle, Volume2, Loader2 } from 'lucide-react';
import { playChildVoice } from '../services/geminiService';

interface ScenarioViewProps {
  scenario: Scenario;
  onChoose: (choiceId: string) => void;
  isProcessing: boolean;
  childGender: 'boy' | 'girl';
  childAge: number;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({ 
  scenario, 
  onChoose, 
  isProcessing,
  childGender,
  childAge
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayAudio = async () => {
    if (!scenario.childDialogue || isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await playChildVoice(scenario.childDialogue, childAge, childGender, scenario.emotion);
    } finally {
      setIsPlayingAudio(false);
    }
  };

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
          {/* Child Dialogue Bubble */}
          {scenario.childDialogue && (
            <div className="flex items-start mb-6 space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warm-200 flex items-center justify-center text-warm-700 font-bold">
                {childGender === 'boy' ? 'B' : 'G'}
              </div>
              <div className="bg-warm-50 border border-warm-100 rounded-2xl rounded-tl-none p-4 max-w-[80%] relative shadow-sm">
                <p className="text-lg font-medium text-warm-900 italic">"{scenario.childDialogue}"</p>
                {scenario.emotion && (
                  <span className="text-xs text-warm-400 mt-1 block uppercase tracking-wide">{scenario.emotion}</span>
                )}
                <button 
                  onClick={handlePlayAudio}
                  disabled={isPlayingAudio}
                  className="absolute -right-12 top-1 p-2 bg-white rounded-full text-warm-600 shadow-md hover:bg-warm-50 hover:text-warm-800 transition border border-warm-100"
                  title="Listen to child"
                >
                  {isPlayingAudio ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                </button>
              </div>
            </div>
          )}

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
