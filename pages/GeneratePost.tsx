
import React, { useState, useRef } from 'react';
import { Upload, Zap, Loader2, Copy, Wand2, Download, Image as ImageIcon, Sparkles, Heart, Info, FileText, Share2, MessageCircle, Bookmark, Check, ChevronRight } from 'lucide-react';
import { generatePostContent, generateEnhancedImage } from '../services/geminiService';
import { PostDraft } from '../types';

const GeneratePost: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState<PostDraft | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultSectionRef = useRef<HTMLDivElement>(null); // For auto-scroll on mobile

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
        setGeneratedDraft(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imagePreview) return;
    setLoading(true);
    setError(null);

    try {
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];
      const content = await generatePostContent(base64Data, mimeType);
      
      const newDraft: PostDraft = {
        id: Date.now().toString(),
        image: imagePreview,
        content
      };
      setGeneratedDraft(newDraft);
      
      // On mobile, scroll to results
      setTimeout(() => {
          if (window.innerWidth < 1024 && resultSectionRef.current) {
              resultSectionRef.current.scrollIntoView({ behavior: 'smooth' });
          }
      }, 100);

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnhanceImage = async () => {
    if (!imagePreview || !generatedDraft) return;
    setEnhancing(true);
    setError(null);

    try {
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];
      const enhancedImage = await generateEnhancedImage(base64Data, mimeType);
      const newImagePreview = `data:${enhancedImage.mimeType};base64,${enhancedImage.data}`;
      setImagePreview(newImagePreview);
      setGeneratedDraft({ ...generatedDraft, image: newImagePreview });
    } catch (err: any) {
      setError(err.message || "Failed to make image better.");
    } finally {
      setEnhancing(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadText = () => {
    if (!generatedDraft) return;
    const c = generatedDraft.content;
    const productNameSlug = c.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const textContent = `PRODUCT NAME: ${c.productName}
------------------------------------------------
WHAT I AM SELLING:
${c.tagline}

------------------------------------------------
1. POST FOR INSTAGRAM & FACEBOOK
(Copy the text below and paste it when you upload the photo)

${c.shortCaption}

HASHTAGS (Add these at the bottom):
${c.hashtags}

------------------------------------------------
2. STORY FOR WHATSAPP / LINKEDIN
(Use this to tell a story about your product)

${c.promotionalCaption}

------------------------------------------------
HELPFUL NOTES:
Who is this for? ${c.audience}
Other ideas: ${c.alternatives}
`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${productNameSlug}_details.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = () => {
    if (!generatedDraft) return;
    const link = document.createElement('a');
    link.href = generatedDraft.image;
    const isJpeg = generatedDraft.image.includes('image/jpeg') || generatedDraft.image.includes('image/jpg');
    const ext = isJpeg ? 'jpg' : 'png';
    const productNameSlug = generatedDraft.content.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${productNameSlug}_product.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-8 lg:pb-0">
      
      {/* 
         LEFT COLUMN: Input Studio 
         - Mobile: Stacks at top, auto height.
         - Desktop: Col span 5, full height, internal scroll.
      */}
      <div className="lg:col-span-5 flex flex-col lg:h-full lg:overflow-hidden">
        <div className="glass-panel rounded-[2rem] p-6 lg:p-8 flex flex-col h-auto lg:h-full relative shadow-xl border-white/50">
          
          {/* Section Header */}
          <div className="flex-none mb-6 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-sm">1</span>
                Input Studio
            </h2>
            {imagePreview && (
                <button onClick={() => {setImagePreview(null); setGeneratedDraft(null);}} className="text-xs text-slate-500 font-bold hover:text-red-500 transition-colors">
                    Reset
                </button>
            )}
          </div>
          
          {/* Scrollable Area (Desktop Only) */}
          <div className="flex-1 lg:overflow-y-auto custom-scrollbar space-y-6 lg:pr-2">
            
            {/* Upload Area */}
            <div 
                className={`relative group cursor-pointer transition-all duration-300 rounded-[2rem] overflow-hidden ${
                imagePreview 
                ? 'ring-4 ring-white shadow-xl shadow-indigo-100' 
                : 'border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-white/50 bg-slate-50/50 min-h-[350px] flex flex-col items-center justify-center'
                }`}
                onClick={() => fileInputRef.current?.click()}
            >
                {imagePreview ? (
                <>
                   <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-auto object-cover" 
                   />
                   <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white px-6 py-3 rounded-full shadow-lg font-bold text-slate-800 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                         <Upload size={18} /> Replace Photo
                      </div>
                   </div>
                </>
                ) : (
                <div className="text-center p-8 pointer-events-none">
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-50 to-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform duration-500">
                        <Upload size={32} className="text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Upload Product Image</h3>
                    <p className="text-slate-500 font-medium text-sm max-w-[200px] mx-auto leading-relaxed">
                        Drag & drop or click to upload<br/>
                        <span className="text-xs text-slate-400">(JPG, PNG max 10MB)</span>
                    </p>
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

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
                <button
                onClick={handleGenerate}
                disabled={!imagePreview || loading || enhancing}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                    !imagePreview || loading || enhancing
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0'
                }`}
                >
                {loading ? (
                    <> <Loader2 className="animate-spin" /> Analyzing...</>
                ) : (
                    <> <Zap size={20} className="text-yellow-400 fill-yellow-400" /> Generate Content </>
                )}
                </button>
                
                {generatedDraft && (
                <button
                    onClick={handleEnhanceImage}
                    disabled={enhancing || loading}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 bg-gradient-to-r from-violet-50 to-indigo-50 text-indigo-700 border border-indigo-100 hover:border-indigo-200 hover:shadow-md transition-all"
                >
                    {enhancing ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                    AI Image Enhancer
                </button>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100 flex items-center gap-3 animate-pulse">
                        <Info size={18} className="shrink-0" /> 
                        <span className="text-balance">{error}</span>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* 
         RIGHT COLUMN: Output Studio 
         - Mobile: Stacks below, auto height.
         - Desktop: Col span 7, full height, internal scroll.
      */}
      <div className="lg:col-span-7 flex flex-col lg:h-full lg:overflow-hidden" ref={resultSectionRef}>
         {generatedDraft ? (
            <div className="glass-panel rounded-[2rem] flex flex-col h-auto lg:h-full relative shadow-xl border-white/50 animate-fade-in-up">
              
              {/* Header Actions - Sticky on Desktop inside panel */}
              <div className="flex-none p-6 border-b border-white/20 bg-white/40 backdrop-blur-md flex flex-col sm:flex-row gap-4 justify-between items-center z-20 rounded-t-[2rem]">
                 <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm shadow-lg shadow-indigo-500/30">2</span>
                    Results
                 </h2>
                 <div className="flex gap-2 w-full sm:w-auto">
                   <button 
                      onClick={handleDownloadText}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all text-sm hover:scale-[1.02] active:scale-95"
                    >
                      <FileText size={16} />
                      <span className="hidden sm:inline">Save Text</span>
                      <span className="sm:hidden">Text</span>
                    </button>
                   <button 
                      onClick={handleDownloadImage}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all text-sm hover:scale-[1.02] active:scale-95"
                    >
                      <Download size={16} />
                      <span className="hidden sm:inline">Save Image</span>
                      <span className="sm:hidden">Image</span>
                    </button>
                 </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-6 space-y-8 bg-white/30">
                
                {/* 1. Hero Card: Product Identity */}
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl overflow-hidden group">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-30 -mr-16 -mt-16 group-hover:opacity-40 transition-opacity duration-1000"></div>
                   <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500 rounded-full blur-[80px] opacity-20 -ml-10 -mb-10"></div>
                   
                   <div className="relative z-10">
                       <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
                          <Sparkles size={14} /> Product Identity
                       </div>
                       <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight tracking-tight text-balance">{generatedDraft.content.productName}</h1>
                       <div className="flex items-start gap-3">
                          <div className="w-1 h-12 bg-indigo-500 rounded-full mt-1"></div>
                          <p className="text-lg lg:text-xl text-slate-200 font-serif italic opacity-90 leading-relaxed">"{generatedDraft.content.tagline}"</p>
                       </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* 2. Instagram Mockup Card */}
                    <div className="space-y-4">
                         <div className="flex justify-between items-center px-1">
                             <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></span> 
                                Social Preview
                             </h3>
                             <button onClick={() => handleCopy(generatedDraft.content.shortCaption, 'insta')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors">
                                {copiedId === 'insta' ? <Check size={14} /> : <Copy size={14} />} Copy Text
                             </button>
                         </div>
                         
                         {/* Mockup UI */}
                         <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                            {/* Insta Header */}
                            <div className="p-3 flex items-center justify-between border-b border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                                        <div className="w-full h-full bg-white rounded-full p-[2px]">
                                            <div className="w-full h-full bg-slate-200 rounded-full overflow-hidden">
                                                <img src={generatedDraft.image} className="w-full h-full object-cover opacity-80 blur-sm" alt="avatar" />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-sm text-slate-900">YourBrand</span>
                                </div>
                                <div className="text-slate-400">•••</div>
                            </div>
                            
                            {/* Image Placeholder */}
                            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                <img src={generatedDraft.image} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Post" />
                                
                                {/* Tag bubble aesthetic */}
                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                                    Product Tag
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-3 flex justify-between text-slate-800">
                                <div className="flex gap-4">
                                    <Heart size={24} className="hover:text-red-500 cursor-pointer transition-colors" />
                                    <MessageCircle size={24} className="hover:text-slate-500 cursor-pointer" />
                                    <Share2 size={24} className="hover:text-slate-500 cursor-pointer" />
                                </div>
                                <Bookmark size={24} className="hover:text-slate-500 cursor-pointer" />
                            </div>

                            {/* Caption Area */}
                            <div className="px-3 pb-5 text-sm text-slate-800">
                                <div className="flex items-center gap-1 mb-2">
                                    <div className="flex -space-x-1.5">
                                        <div className="w-4 h-4 rounded-full bg-slate-300 border border-white"></div>
                                        <div className="w-4 h-4 rounded-full bg-slate-400 border border-white"></div>
                                        <div className="w-4 h-4 rounded-full bg-slate-500 border border-white"></div>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-900">Liked by others</p>
                                </div>
                                <p className="mb-2 leading-relaxed text-[13px]">
                                    <span className="font-bold mr-2 text-sm">YourBrand</span>
                                    {generatedDraft.content.shortCaption}
                                </p>
                                <p className="text-indigo-900/70 text-[11px] leading-relaxed font-medium mt-3 font-mono">{generatedDraft.content.hashtags}</p>
                            </div>
                         </div>
                    </div>

                    {/* 3. Story / Strategy Column */}
                    <div className="space-y-6">
                        {/* Story Card */}
                        <div className="space-y-4">
                             <div className="flex justify-between items-center px-1">
                                 <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                                    Storytelling
                                 </h3>
                                 <button onClick={() => handleCopy(generatedDraft.content.promotionalCaption, 'story')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors">
                                    {copiedId === 'story' ? <Check size={14} /> : <Copy size={14} />} Copy Story
                                 </button>
                             </div>
                             <div className="bg-white/70 p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all text-[13px] leading-6 text-slate-700 whitespace-pre-wrap relative group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-green-400 to-emerald-600 rounded-l-2xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                {generatedDraft.content.promotionalCaption}
                             </div>
                        </div>

                        {/* Strategy Chips */}
                        <div className="space-y-4">
                             <h3 className="font-bold text-slate-700 px-1 text-sm uppercase tracking-wide">Strategy Insights</h3>
                             <div className="grid gap-4">
                                 <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-5 rounded-2xl flex gap-4 items-start shadow-sm">
                                     <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 shrink-0 mt-0.5 shadow-inner"><Info size={18} /></div>
                                     <div>
                                         <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 mb-1">Target Audience</h4>
                                         <p className="text-sm text-slate-700 font-medium leading-relaxed">{generatedDraft.content.audience}</p>
                                     </div>
                                 </div>
                                 <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-5 rounded-2xl flex gap-4 items-start shadow-sm">
                                     <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shrink-0 mt-0.5 shadow-inner"><Sparkles size={18} /></div>
                                     <div>
                                         <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1">Sales Ideas</h4>
                                         <p className="text-sm text-slate-700 font-medium leading-relaxed">{generatedDraft.content.alternatives}</p>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                </div>

              </div>
            </div>
         ) : (
           <div className="h-full glass-panel rounded-[2rem] flex flex-col items-center justify-center p-8 lg:p-12 text-center relative overflow-hidden shadow-xl border-white/50 min-h-[400px]">
             <div className="relative z-10 max-w-sm space-y-8">
                <div className="relative">
                    <div className="w-32 h-32 bg-white/60 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200/50 ring-1 ring-white">
                        <ImageIcon size={48} className="text-slate-300" />
                    </div>
                    {/* Floating Orbs */}
                    <div className="absolute top-0 right-10 w-12 h-12 bg-indigo-400 rounded-full blur-xl animate-pulse opacity-60"></div>
                    <div className="absolute bottom-0 left-10 w-16 h-16 bg-pink-400 rounded-full blur-xl animate-pulse delay-700 opacity-60"></div>
                </div>
                
                <div>
                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Social Content Studio</h3>
                    <p className="text-slate-500 font-medium leading-relaxed text-balance">
                    Upload your product photo on the left. Our AI will craft the perfect social media strategy for you.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                       Supported by
                   </div>
                   <div className="inline-flex gap-2 items-center justify-center bg-white/50 px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 border border-white/60 shadow-sm">
                        <Sparkles size={14} className="text-indigo-500 fill-indigo-500" /> Gemini 2.5 Flash
                   </div>
                </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default GeneratePost;
