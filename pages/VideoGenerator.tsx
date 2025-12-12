import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Loader2, Play, Download, Film, Monitor, Smartphone, CreditCard } from 'lucide-react';
import { generateVeoVideo } from '../services/geminiService';

const VideoGenerator: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Slow cinematic pan of the product, professional studio lighting, 4k high quality');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [needsKey, setNeedsKey] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    if ((window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            setNeedsKey(true);
        }
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
        try {
            await (window as any).aistudio.openSelectKey();
            setNeedsKey(false);
            setError(null);
        } catch (e) {
            console.error("Key selection failed", e);
        }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setError(null);
        setVideoUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imagePreview) return;
    
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];

      const url = await generateVeoVideo(base64Data, mimeType, prompt, aspectRatio);
      setVideoUrl(url);

    } catch (err: any) {
      const msg = err.message || JSON.stringify(err);
      
      // Handle the specific "Requested entity was not found" (404) error
      // This indicates the project/key does not have access or is not a paid project.
      if (msg.includes("Requested entity was not found") || msg.includes("404")) {
         setNeedsKey(true);
         setError("To use Veo, you must select a Google Cloud Project with billing enabled.");
      } else {
         setError(msg || "Failed to generate video. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Input Section */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <div className="bg-pink-100 p-2 rounded-xl text-pink-600">
               <Film size={24} />
            </div>
            Veo Video Magic
          </h2>
          
          {/* Image Upload */}
          <div 
            className={`relative min-h-[250px] border-3 border-dashed rounded-3xl flex flex-col items-center justify-center p-4 transition-all duration-300 group overflow-hidden mb-6 ${
              imagePreview ? 'border-pink-300 bg-slate-50' : 'border-slate-300 hover:border-pink-400 hover:bg-pink-50/30'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-auto max-h-[300px] object-cover rounded-2xl shadow-sm" 
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                    setVideoUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-500 hover:text-red-600 p-2 rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  <Upload size={18} className="rotate-45" />
                </button>
              </div>
            ) : (
              <div className="text-center cursor-pointer p-8">
                <div className="w-16 h-16 bg-gradient-to-tr from-pink-100 to-rose-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-1">Upload Source Image</h3>
                <p className="text-slate-400 text-xs">JPG or PNG (Max 10MB)</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* Aspect Ratio Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Video Format</label>
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        aspectRatio === '16:9' 
                        ? 'border-pink-500 bg-pink-50 text-pink-700' 
                        : 'border-slate-200 hover:border-pink-200 text-slate-500'
                    }`}
                >
                    <Monitor size={24} className="mb-2" />
                    <span className="text-xs font-bold">Landscape (16:9)</span>
                </button>
                <button 
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        aspectRatio === '9:16' 
                        ? 'border-pink-500 bg-pink-50 text-pink-700' 
                        : 'border-slate-200 hover:border-pink-200 text-slate-500'
                    }`}
                >
                    <Smartphone size={24} className="mb-2" />
                    <span className="text-xs font-bold">Portrait (9:16)</span>
                </button>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
             <label className="block text-sm font-semibold text-slate-700 mb-2">Motion Prompt</label>
             <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm text-slate-700 h-24 resize-none"
                placeholder="Describe how the object should move..."
             />
          </div>

          {/* Generate Button or Key Selection */}
          {needsKey ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                  <h3 className="text-amber-800 font-bold text-lg mb-2">Billing Project Required</h3>
                  <p className="text-amber-700 text-sm mb-4">
                      Generating videos with Veo requires a Google Cloud Project with billing enabled.
                  </p>
                  <button
                    onClick={handleSelectKey}
                    className="w-full py-3 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
                  >
                      <CreditCard size={20} /> Select Paid API Key
                  </button>
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="block mt-3 text-xs text-amber-600 hover:underline">
                      Learn about Gemini API billing
                  </a>
              </div>
          ) : (
              <button
                onClick={handleGenerate}
                disabled={!imagePreview || loading}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                  !imagePreview || loading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:shadow-xl hover:shadow-pink-200'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Generating Video...
                  </>
                ) : (
                  <>
                    <Video size={20} fill="currentColor" /> Generate Video
                  </>
                )}
              </button>
          )}
          
          {loading && (
             <p className="text-xs text-slate-500 text-center mt-3 animate-pulse">
                This may take 1-2 minutes. Please don't close the tab.
             </p>
          )}

          {error && <p className="text-red-500 text-sm mt-4 text-center bg-red-50 py-3 rounded-xl border border-red-100">{error}</p>}
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:col-span-7">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 h-full min-h-[500px] flex flex-col p-8 relative overflow-hidden">
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Generated Video</h3>
                {videoUrl && (
                    <a 
                        href={videoUrl} 
                        download="veo-generated-video.mp4"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm font-bold text-pink-600 bg-pink-50 px-4 py-2 rounded-xl hover:bg-pink-100 transition-colors"
                    >
                        <Download size={16} /> Download
                    </a>
                )}
            </div>

            <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden relative">
                {loading ? (
                    <div className="text-center">
                        <div className="w-20 h-20 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <h4 className="text-lg font-bold text-slate-700 mb-2">Creating Magic with Veo</h4>
                        <p className="text-slate-500 text-sm">AI is animating your image...</p>
                    </div>
                ) : videoUrl ? (
                    <video 
                        src={videoUrl} 
                        controls 
                        autoPlay 
                        loop 
                        className="w-full h-full object-contain max-h-[600px]"
                    />
                ) : (
                    <div className="text-center opacity-40">
                        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Play size={40} className="text-slate-400 ml-2" />
                        </div>
                        <p className="text-slate-500 font-medium">Video preview will appear here</p>
                    </div>
                )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-0.5">
                    <Monitor size={16} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-800">Pro Tip</h4>
                    <p className="text-xs text-blue-600 mt-1">
                        Use generated videos for Facebook Reels or Instagram Stories to get 3x more engagement than static images.
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;