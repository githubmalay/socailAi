import React, { useState, useRef, useEffect } from 'react';
import { Bot, Minimize2, Mic, StopCircle, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0); // For visualizer
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio Context & Processing Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Gemini Live Session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Initialize Audio Context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000 // Gemini Native Audio standard
      });
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);
    }
  };

  const startLiveSession = async () => {
    setError(null);
    initAudioContext();
    
    try {
      // 1. Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. Connect to Gemini Live API
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            setupAudioInput(stream);
            setIsLive(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            handleServerMessage(message);
          },
          onerror: (e: any) => {
            console.error("Gemini Live Error", e);
            setError("Connection error. Please try again.");
            stopLiveSession();
          },
          onclose: (e: any) => {
            console.log("Gemini Live Closed", e);
            setIsLive(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "You are a warm, encouraging, and helpful assistant for SHG (Self Help Group) women entrepreneurs. Speak simply, clearly, and supportively. Keep answers concise.",
        },
      });

    } catch (err: any) {
      console.error("Failed to start live session", err);
      setError("Could not access microphone or connect.");
    }
  };

  const setupAudioInput = (stream: MediaStream) => {
    if (!audioContextRef.current) return;

    // Create input source
    const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = inputContext.createMediaStreamSource(stream);
    
    // Create processor for PCM data
    // Buffer size 4096, 1 input channel, 1 output channel
    const processor = inputContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += Math.abs(inputData[i]);
      }
      setVolume(sum / inputData.length);

      const pcmBlob = createPcmBlob(inputData);

      // Send to Gemini
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      }
    };

    source.connect(processor);
    processor.connect(inputContext.destination);

    inputSourceRef.current = source;
    processorRef.current = processor;
  };

  const handleServerMessage = async (message: LiveServerMessage) => {
    // Process Audio Output
    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio && audioContextRef.current && outputNodeRef.current) {
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(
            decodeBase64(base64Audio),
            ctx,
            24000,
            1
        );
        
        // Schedule playback
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNodeRef.current);
        
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        
        sourcesRef.current.add(source);
        source.onended = () => sourcesRef.current.delete(source);
    }

    // Handle Interruption
    if (message.serverContent?.interrupted) {
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    }
  };

  const stopLiveSession = () => {
    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Disconnect nodes
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputSourceRef.current) {
        inputSourceRef.current.disconnect();
        inputSourceRef.current = null;
    }

    // Close Gemini session if possible (wrapper doesn't expose explicit close easily, 
    // but stopping input effectively ends the turn)
    setIsLive(false);
    setVolume(0);
    
    // Clear audio queue
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
  };

  // --- Utils ---

  const createPcmBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        // Clamp and convert float to int16
        const s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const uint8 = new Uint8Array(int16.buffer);
    
    // Manual base64 encoding to avoid external deps/overhead
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    const base64 = btoa(binary);

    return {
        data: base64,
        mimeType: 'audio/pcm;rate=16000'
    };
  };

  const decodeBase64 = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
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
  };

  useEffect(() => {
    // Mute/Unmute toggle for output node
    if (outputNodeRef.current && audioContextRef.current) {
        outputNodeRef.current.gain.setValueAtTime(isMuted ? 0 : 1, audioContextRef.current.currentTime);
    }
  }, [isMuted]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* Expanded Live Interface */}
      {isOpen && (
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 w-80 h-96 flex flex-col animate-fade-in-up overflow-hidden ring-1 ring-slate-900/5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex items-center justify-between text-white">
             <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                   <Bot size={20} />
                </div>
                <div>
                   <h3 className="font-bold text-base">Live Coach</h3>
                   <div className="flex items-center gap-1.5">
                       <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></span>
                       <span className="text-xs text-indigo-100">{isLive ? 'Connected' : 'Offline'}</span>
                   </div>
                </div>
             </div>
             <div className="flex gap-1">
                 <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/20 rounded-lg">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                 </button>
                 <button onClick={() => { setIsOpen(false); stopLiveSession(); }} className="p-2 hover:bg-white/20 rounded-lg">
                    <Minimize2 size={18} />
                 </button>
             </div>
          </div>

          {/* Visualization / Status Area */}
          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
             
             {error ? (
                <div className="text-center px-6">
                    <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
                    <p className="text-sm text-slate-600">{error}</p>
                    <button onClick={startLiveSession} className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">Retry</button>
                </div>
             ) : (
                 <>
                    {/* Visualizer Circles */}
                    <div className="relative flex items-center justify-center">
                        <div 
                            className={`w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center transition-all duration-100 shadow-xl shadow-indigo-200 z-10 ${!isLive ? 'opacity-50 grayscale' : ''}`}
                            style={{ transform: `scale(${1 + volume * 5})` }} // Simple volume visualizer
                        >
                            <Mic size={32} className="text-white" />
                        </div>
                        {isLive && (
                             <>
                                <div className="absolute w-32 h-32 bg-violet-400/20 rounded-full animate-ping"></div>
                                <div className="absolute w-48 h-48 bg-indigo-400/10 rounded-full animate-pulse delay-75"></div>
                             </>
                        )}
                    </div>
                    
                    <p className="mt-8 text-slate-500 font-medium text-sm animate-pulse">
                        {isLive ? "Listening & Speaking..." : "Tap Start to talk"}
                    </p>
                 </>
             )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-white border-t border-slate-100">
             {!isLive ? (
                <button 
                   onClick={startLiveSession}
                   className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                   <Mic size={18} /> Start Conversation
                </button>
             ) : (
                <button 
                   onClick={stopLiveSession}
                   className="w-full py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                   <StopCircle size={18} /> End Session
                </button>
             )}
          </div>

        </div>
      )}

      {/* Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); }}
          className="group flex items-center gap-3 bg-white p-2 pr-6 rounded-full shadow-2xl shadow-violet-900/20 hover:-translate-y-1 transition-all duration-300 border border-white/50 backdrop-blur-md ring-1 ring-slate-900/5"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white relative">
            <Bot size={24} />
            <span className="absolute top-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex flex-col items-start">
             <span className="font-bold text-slate-800 text-sm">Live Coach</span>
             <span className="text-[10px] text-violet-600 font-bold bg-violet-50 px-2 py-0.5 rounded-full mt-0.5">Gemini Live</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default ChatAssistant;
