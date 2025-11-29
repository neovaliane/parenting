import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { GameState, Scenario, Outcome, GameStage } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash"; // Fast and capable for text logic
const ttsModelId = "gemini-2.5-flash-preview-tts";

// Schema for Scenario Generation
const scenarioSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short title for the event." },
    description: { type: Type.STRING, description: "The detailed situation description facing the parent." },
    childDialogue: { type: Type.STRING, description: "A short, direct quote of what the child says (e.g. 'I don't want to go!'). If infant, describe sound (e.g. 'Waaaaa!')." },
    emotion: { type: Type.STRING, description: "The emotion of the child (e.g., 'Angry', 'Sad', 'Excited', 'Curious')." },
    context: { type: Type.STRING, description: "Hidden context about the child's hidden feelings or the situation's truth." },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "The dialogue or action the parent takes." },
          style: { 
            type: Type.STRING, 
            description: "The parenting style category (e.g., Empathetic, Authoritarian, etc.)" 
          }
        },
        required: ["id", "text", "style"]
      }
    }
  },
  required: ["title", "description", "childDialogue", "emotion", "context", "choices"]
};

// Schema for Outcome Evaluation
const outcomeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: { type: Type.STRING, description: "What happens immediately after the parent's choice." },
    childReaction: { type: Type.STRING, description: "Visual description of the child's reaction (e.g., facial expression)." },
    childDialogue: { type: Type.STRING, description: "The child's verbal response to the parent. Keep it short." },
    emotion: { type: Type.STRING, description: "The emotion of the response." },
    feedback: { type: Type.STRING, description: "Psychological analysis of why this choice was good or bad, and advice for the future." },
    statChanges: {
      type: Type.OBJECT,
      properties: {
        bonding: { type: Type.INTEGER, description: "Change in relationship score (-10 to 10)" },
        resilience: { type: Type.INTEGER, description: "Change in resilience score (-10 to 10)" },
        confidence: { type: Type.INTEGER, description: "Change in confidence score (-10 to 10)" }
      },
      required: ["bonding", "resilience", "confidence"]
    }
  },
  required: ["narrative", "childReaction", "childDialogue", "emotion", "feedback", "statChanges"]
};

export const generateScenario = async (gameState: GameState): Promise<Scenario> => {
  const { childName, age, stage, stats, childGender } = gameState;
  
  const prompt = `
    You are a parenting simulation engine.
    Child: ${childName}, Gender: ${childGender}, Age: ${age}, Stage: ${stage}.
    Current Stats: Bonding(${stats.bonding}), Resilience(${stats.resilience}), Confidence(${stats.confidence}).

    Generate a realistic parenting scenario appropriate for this age.
    
    Specific Focus Areas (mix these randomly or based on age):
    - Toddler: Tantrums, eating, potty training, sharing.
    - Elementary: Not talking about school, fear of failure (e.g. sports), bullying, homework struggle, lying.
    - Teen: Privacy, peer pressure, independence, dating, academic stress.
    
    The scenario should be a specific moment requiring a parental response.
    Provide 3 distinct choices representing different parenting styles (e.g., Supportive/Empathetic, Strict/Authoritarian, Dismissive/Permissive).
    
    Ensure the "Empathetic" choice isn't always obvious; sometimes "Strict" is needed for safety, but usually "Empathetic" helps bonding.
    
    IMPORTANT: Provide a "childDialogue" field with exactly what the child says. If they are an infant, write the sounds (e.g. "Goo goo", "WAAAA!").
    
    Language: Simplified Chinese (zh-CN) for all user-facing text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scenarioSchema,
        temperature: 0.8, // Slight creativity for scenarios
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      id: Date.now().toString(),
      ...data
    } as Scenario;

  } catch (error) {
    console.error("Error generating scenario:", error);
    // Fallback scenario
    return {
      id: "error-fallback",
      title: "Connection Issue",
      description: "You try to connect with your child, but something feels off (Network Error).",
      childDialogue: "...",
      emotion: "Neutral",
      context: "Network error",
      choices: [{ id: "retry", text: "Try again", style: "Empathetic" }]
    };
  }
};

export const evaluateResponse = async (
  gameState: GameState, 
  scenario: Scenario, 
  choiceId: string
): Promise<Outcome> => {
  const choice = scenario.choices.find(c => c.id === choiceId);
  const choiceText = choice ? choice.text : "Silent observation";

  const prompt = `
    Context: ${scenario.context}
    Situation: ${scenario.description}
    Child: ${gameState.childName} (${gameState.age} yo).
    Parent chose: "${choiceText}" (Style: ${choice?.style}).

    Evaluate this choice. 
    1. How does the child react immediately?
    2. How does this affect their long-term growth (Stats)?
    3. Provide expert parenting advice (Feedback) explaining the psychology behind the reaction.
    4. Provide specific dialogue for the child in "childDialogue".

    Language: Simplified Chinese (zh-CN).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: outcomeSchema,
        temperature: 0.4, // More analytical for feedback
      },
    });

    return JSON.parse(response.text || "{}") as Outcome;
  } catch (error) {
    console.error("Error evaluating response:", error);
    return {
      narrative: "Something unexpected happened.",
      childReaction: "Confused.",
      childDialogue: "???",
      emotion: "Confused",
      feedback: "Network error prevented analysis.",
      statChanges: { bonding: 0, resilience: 0, confidence: 0 }
    };
  }
};

// Audio Utilities
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  // Simple check for WAV header to avoid PCM assumption if model changes, 
  // but strictly sticking to PCM handling logic as per instructions usually implies raw PCM.
  // The instruction example manually creates buffer. We will follow that.
  
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playChildVoice = async (text: string, age: number, gender: 'boy' | 'girl', emotion: string = 'Neutral') => {
  if (!text) return;

  // Select voice based on Age and Gender
  // Available voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
  let voiceName = 'Puck'; // Default (soft, neutral)

  if (age < 10) {
    voiceName = 'Puck'; // Young child
  } else if (gender === 'girl') {
    voiceName = 'Kore'; // Female
  } else {
    voiceName = 'Fenrir'; // Male
  }

  try {
    // Add emotional context to the prompt text if needed, 
    // but usually the instruction prompt handles the intonation.
    // For TTS, we just send the text.
    const response = await ai.models.generateContent({
      model: ttsModelId,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        audioContext
      );
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("Error generating/playing voice:", error);
  }
};
