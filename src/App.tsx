import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2, AlertCircle, Send, Heart, Frown, Angry, Meh } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';

type Emotion = 'angry' | 'happy' | 'sad' | 'neutral';

interface EmotionResult {
  emotion: Emotion;
  confidence: number;
}

interface EmotionDetails {
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
}

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [emotion, setEmotion] = useState<EmotionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [textInput, setTextInput] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const modelRef = useRef<tf.LayersModel | null>(null);

  const emotionDetails: Record<Emotion, EmotionDetails> = {
    happy: {
      icon: <Heart className="w-8 h-8" />,
      description: "You're expressing joy and positivity!",
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    sad: {
      icon: <Frown className="w-8 h-8" />,
      description: "I sense some sadness in your words.",
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    angry: {
      icon: <Angry className="w-8 h-8" />,
      description: "There's some frustration in your tone.",
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    neutral: {
      icon: <Meh className="w-8 h-8" />,
      description: "You're maintaining a balanced perspective.",
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  };

  useEffect(() => {
    // Load the TensorFlow.js model
    const loadModel = async () => {
      try {
        // In a real application, you would load a pre-trained model here
        // For demo purposes, we'll create a simple model
        const model = tf.sequential({
          layers: [
            tf.layers.dense({ units: 64, activation: 'relu', inputShape: [100] }),
            tf.layers.dense({ units: 32, activation: 'relu' }),
            tf.layers.dense({ units: 4, activation: 'softmax' })
          ]
        });
        modelRef.current = model;
        setIsModelLoading(false);
      } catch (err) {
        setError('Failed to load emotion recognition model');
        setIsModelLoading(false);
      }
    };

    loadModel();

    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(transcript);
        analyzeEmotion(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        setError('Error with speech recognition: ' + event.error);
        setIsListening(false);
      };
    } else {
      setError('Speech recognition is not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const analyzeEmotion = async (text: string) => {
    if (!modelRef.current || !text.trim()) return;

    try {
      // In a real application, you would:
      // 1. Preprocess the text
      // 2. Convert to features
      // 3. Run through the model
      // For demo, we'll simulate random emotions
      const emotions: Emotion[] = ['happy', 'sad', 'angry', 'neutral'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const confidence = Math.random() * 0.5 + 0.5; // Random confidence between 0.5 and 1

      setEmotion({
        emotion: randomEmotion,
        confidence: confidence
      });
    } catch (err) {
      setError('Error analyzing emotion');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    setTranscript(textInput);
    analyzeEmotion(textInput);
    setTextInput('');
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError(null);
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Voice Emotion Recognition
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {isModelLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading emotion recognition model...</span>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-8">
                <button
                  onClick={toggleListening}
                  disabled={!!error || isModelLoading}
                  className={`p-6 rounded-full transition-all ${
                    isListening
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8 animate-pulse" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}

              <div className="mb-6">
                <form onSubmit={handleTextSubmit} className="mb-6">
                  <label htmlFor="textInput" className="block text-sm font-medium text-gray-700 mb-2">
                    Or type your text here:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="textInput"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type something to analyze..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!textInput.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Latest Analysis</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                    <Volume2 className="w-5 h-5 mr-2" />
                    Transcript
                  </h2>
                  <div className="p-4 bg-gray-50 rounded-lg min-h-[100px] text-gray-600">
                    {transcript || 'Start speaking or type something to analyze...'}
                  </div>
                </div>
              </div>

              {emotion && (
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Emotional Expression</h2>
                  <div className={`p-6 rounded-lg ${emotionDetails[emotion.emotion].bgColor} mb-4`}>
                    <div className={`${emotionDetails[emotion.emotion].color} mb-4`}>
                      {emotionDetails[emotion.emotion].icon}
                    </div>
                    <div className="text-xl font-semibold mb-2 capitalize">
                      {emotion.emotion}
                    </div>
                    <p className="text-gray-700">
                      {emotionDetails[emotion.emotion].description}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Confidence: {Math.round(emotion.confidence * 100)}%
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
        </div>
      </div>
    </div>
  );
}

export default App;