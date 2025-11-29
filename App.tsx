import React, { useState, useEffect, useRef } from 'react';
import { StartScreen } from './components/StartScreen';
import { Dashboard } from './components/Dashboard';
import { ScenarioView } from './components/ScenarioView';
import { FeedbackView } from './components/FeedbackView';
import { GameState, Scenario, Outcome, GameStage } from './types';
import { generateScenario, evaluateResponse } from './services/geminiService';
import { STAGE_CONFIG } from './constants';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [currentOutcome, setCurrentOutcome] = useState<Outcome | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we need to fetch a scenario on mount/update
  const shouldFetchScenario = useRef(false);

  const startGame = (initialState: Partial<GameState>) => {
    setGameState(initialState as GameState);
    shouldFetchScenario.current = true;
  };

  const fetchNewScenario = async () => {
    if (!gameState) return;
    setLoading(true);
    setError(null);
    try {
      const scenario = await generateScenario(gameState);
      setCurrentScenario(scenario);
      setCurrentOutcome(null);
    } catch (e) {
      setError("Failed to generate scenario. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gameState && shouldFetchScenario.current) {
      shouldFetchScenario.current = false;
      fetchNewScenario();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const handleChoice = async (choiceId: string) => {
    if (!gameState || !currentScenario) return;
    setLoading(true);
    
    try {
      const outcome = await evaluateResponse(gameState, currentScenario, choiceId);
      
      // Update Stats
      const newStats = {
        bonding: Math.max(0, Math.min(100, gameState.stats.bonding + outcome.statChanges.bonding)),
        resilience: Math.max(0, Math.min(100, gameState.stats.resilience + outcome.statChanges.resilience)),
        confidence: Math.max(0, Math.min(100, gameState.stats.confidence + outcome.statChanges.confidence)),
      };
      
      setGameState(prev => prev ? {
        ...prev,
        stats: newStats,
        history: [...prev.history, `Age ${prev.age}: ${currentScenario.title}`]
      } : null);
      
      setCurrentOutcome(outcome);
    } catch (e) {
      setError("Failed to evaluate response.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNextTurn = () => {
    if (!gameState) return;

    // Age Progression Logic
    // We increment age slightly or jump years depending on stage
    let newAge = gameState.age;
    let newStage = gameState.stage;

    // Simple progression: +1 year usually, but depends on current logic
    // For MVP, let's just increment by 1 or 2 years until 18
    if (gameState.age < 18) {
       newAge += 1;
       // Or bigger jumps if early age? Let's stick to +1 to allow more scenarios
       // Update Stage based on Age
       if (newAge >= 1 && newAge < 3) newStage = GameStage.Toddler;
       else if (newAge >= 3 && newAge < 6) newStage = GameStage.Preschool;
       else if (newAge >= 6 && newAge < 13) newStage = GameStage.Elementary;
       else if (newAge >= 13 && newAge < 18) newStage = GameStage.Teen;
       else if (newAge >= 18) newStage = GameStage.Adult;
    }

    setGameState(prev => prev ? {
      ...prev,
      age: newAge,
      stage: newStage
    } : null);

    setCurrentScenario(null);
    setCurrentOutcome(null);
    shouldFetchScenario.current = true;
  };

  if (!gameState) {
    return <StartScreen onStart={startGame} />;
  }

  return (
    <div className="min-h-screen bg-warm-50 font-sans text-slate-800 pb-12">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Dashboard gameState={gameState} />
        
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
                <button onClick={() => window.location.reload()} className="ml-2 underline">Reload</button>
            </div>
        )}

        {loading && !currentOutcome && !currentScenario && (
           <div className="flex flex-col items-center justify-center py-20 text-warm-600 space-y-4">
             <Loader2 className="animate-spin" size={48} />
             <p className="text-lg animate-pulse">Growing up takes time...</p>
           </div>
        )}

        {!loading && currentScenario && !currentOutcome && (
          <ScenarioView 
            scenario={currentScenario} 
            onChoose={handleChoice} 
            isProcessing={loading}
            childGender={gameState.childGender}
            childAge={gameState.age}
          />
        )}

        {currentOutcome && currentScenario && (
          <FeedbackView 
            outcome={currentOutcome} 
            previousScenario={currentScenario} 
            onNext={handleNextTurn}
            childGender={gameState.childGender}
            childAge={gameState.age}
          />
        )}
        
        {gameState.stage === GameStage.Adult && !loading && !currentScenario && (
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
                <h2 className="text-3xl font-bold text-warm-800 mb-4">Journey Complete</h2>
                <p className="text-lg text-gray-600 mb-6">
                    {gameState.childName} has grown into an adult. 
                    Based on your guidance, they have formed their own path.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                     <div className="p-4 bg-gray-50 rounded-lg">
                         <div className="text-2xl font-bold text-rose-500">{gameState.stats.bonding}%</div>
                         <div className="text-sm text-gray-500">Final Bonding</div>
                     </div>
                     <div className="p-4 bg-gray-50 rounded-lg">
                         <div className="text-2xl font-bold text-blue-500">{gameState.stats.resilience}%</div>
                         <div className="text-sm text-gray-500">Final Resilience</div>
                     </div>
                     <div className="p-4 bg-gray-50 rounded-lg">
                         <div className="text-2xl font-bold text-amber-500">{gameState.stats.confidence}%</div>
                         <div className="text-sm text-gray-500">Final Confidence</div>
                     </div>
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-warm-600 text-white rounded-lg hover:bg-warm-700 transition"
                >
                    Start New Journey
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;