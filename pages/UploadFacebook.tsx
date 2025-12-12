
import React, { useState, useEffect } from 'react';
import { Facebook, Send, Image as ImageIcon, ThumbsUp, MessageCircle, Share2, Globe, MoreHorizontal, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context';
import { uploadPhotoToFacebook, base64ToBlob, loginWithFacebook, getFacebookPages, initFacebookSdk } from '../services/facebookService';
import { Link } from 'react-router-dom';

const UploadFacebook: React.FC = () => {
  const { currentDraft, fbUser, setFbUser, fbPages, setFbPages, selectedPage, setSelectedPage } = useApp();
  
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize SDK
  useEffect(() => {
    initFacebookSdk()
      .then(() => setIsInitializing(false))
      .catch((err) => {
        console.error("FB SDK Init error", err);
        setIsInitializing(false);
      });
  }, []);

  // Initialize caption from draft if available
  useEffect(() => {
    if (currentDraft) {
      setCaption(currentDraft.content.shortCaption);
    }
  }, [currentDraft]);

  const handleLogin = async () => {
    setError(null);
    try {
      const user = await loginWithFacebook();
      setFbUser(user);
      
      // Fetch Pages immediately after login
      const pages = await getFacebookPages();
      setFbPages(pages);
      
      if (pages.length > 0) {
        setSelectedPage(pages[0]);
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleLogout = () => {
    setFbUser(null);
    setFbPages([]);
    setSelectedPage(null);
  };

  const handleUpload = async () => {
    if (!currentDraft || !selectedPage || !caption) {
      setError("Please select a page and ensure an image is generated.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const mimeType = currentDraft.image.split(';')[0].split(':')[1];
      const base64Data = currentDraft.image.split(',')[1];
      const blob = base64ToBlob(base64Data, mimeType);

      await uploadPhotoToFacebook(selectedPage.id, selectedPage.access_token, caption, blob);
      setSuccess("Successfully uploaded!");
    } catch (err: any) {
      setError(err.message || "Failed to upload.");
    } finally {
      setUploading(false);
    }
  };

  if (!currentDraft) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center mt-12">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-16">
          <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <ImageIcon size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No Image Selected</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Please generate a post content first to have an image ready for upload.</p>
          <Link to="/generate" className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg transition-all">
            Go to Generator
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-10 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
           <Facebook size={24} fill="currentColor" /> 
        </div>
        Upload to Facebook
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left: Realistic Facebook Preview */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-700 text-lg">Post Preview</h3>
          
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden max-w-[500px] mx-auto lg:mx-0 ring-1 ring-black/5">
            {/* Header */}
            <div className="p-4 flex items-start justify-between">
              <div className="flex gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 border border-slate-100 overflow-hidden">
                    {selectedPage ? (
                        <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                            {selectedPage.name.charAt(0)}
                        </div>
                    ) : (
                        <div className="w-full h-full bg-slate-300"></div>
                    )}
                 </div>
                 <div>
                   <div className="font-semibold text-[15px] text-slate-900 leading-tight hover:underline cursor-pointer">
                       {selectedPage ? selectedPage.name : "Your Page Name"}
                   </div>
                   <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-normal">
                     Just now · <Globe size={10} />
                   </div>
                 </div>
              </div>
              <button className="text-slate-500 hover:bg-slate-100 rounded-full p-2"><MoreHorizontal size={20} /></button>
            </div>
            
            {/* Caption */}
            <div className="px-4 pb-3 text-[15px] text-slate-900 whitespace-pre-wrap leading-normal font-normal font-sans">
              {caption || "Write a caption..."}
              {currentDraft.content.hashtags && (
                <span className="text-blue-600 block mt-2 cursor-pointer hover:underline">{currentDraft.content.hashtags}</span>
              )}
            </div>

            {/* Image */}
            <div className="bg-slate-100 relative">
               <img src={currentDraft.image} alt="Preview" className="w-full h-auto block object-cover max-h-[500px]" />
            </div>

            {/* Stats */}
            <div className="px-4 py-3 flex justify-between items-center border-b border-slate-100 mx-1">
               <div className="flex items-center gap-1.5">
                  <div className="bg-[#1877F2] rounded-full p-1"><ThumbsUp size={10} className="text-white" fill="white" /></div>
                  <span className="text-xs text-slate-500 hover:underline cursor-pointer">You and 12 others</span>
               </div>
               <div className="text-xs text-slate-500 font-normal">
                 <span className="hover:underline cursor-pointer">3 comments</span> · <span className="hover:underline cursor-pointer">1 share</span>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="px-2 py-1 flex items-center justify-between">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 text-[15px] font-semibold">
                <ThumbsUp size={18} /> Like
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 text-[15px] font-semibold">
                <MessageCircle size={18} /> Comment
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 text-[15px] font-semibold">
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Right: Connect & Form */}
        <div className="space-y-6">
            
          {/* Connection Card */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
               Account Connection
            </h3>

            {!fbUser ? (
                <div className="text-center py-8">
                    <p className="text-sm text-slate-500 mb-6">Connect your Facebook account to list your pages.</p>
                    <button 
                        onClick={handleLogin}
                        className="bg-[#1877F2] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-3 mx-auto shadow-lg shadow-blue-200 w-full justify-center text-lg"
                    >
                        <Facebook size={24} fill="white" /> Login with Facebook
                    </button>
                    {isInitializing && <p className="text-xs text-slate-400 mt-4 animate-pulse">Initializing SDK...</p>}
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl mb-6 border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 ring-2 ring-white">
                                {fbUser.picture?.data.url && <img src={fbUser.picture.data.url} alt="Profile" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{fbUser.name}</p>
                                <p className="text-xs text-green-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Connected</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
                            <LogOut size={14} /> Logout
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 ml-1">Select Page</label>
                        {fbPages.length > 0 ? (
                            <select 
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-slate-50 hover:bg-white transition-colors font-medium text-slate-700"
                                value={selectedPage?.id || ''}
                                onChange={(e) => {
                                    const page = fbPages.find(p => p.id === e.target.value);
                                    setSelectedPage(page || null);
                                }}
                            >
                                {fbPages.map(page => (
                                    <option key={page.id} value={page.id}>{page.name}</option>
                                ))}
                            </select>
                        ) : (
                             <div className="text-sm text-orange-500 bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-2">
                                <AlertTriangle size={18} /> No pages found for this account.
                             </div>
                        )}
                    </div>
                </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-800 mb-4 text-lg">Customize Caption</h3>
             <textarea 
               value={caption}
               onChange={(e) => setCaption(e.target.value)}
               className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[160px] text-slate-800 text-sm leading-relaxed resize-none bg-slate-50 focus:bg-white transition-colors"
               placeholder="Enter your caption here..."
             />
             <div className="flex gap-3 mt-4 flex-wrap">
                <button 
                  onClick={() => setCaption(currentDraft.content.promotionalCaption)}
                  className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg transition-colors border border-indigo-200"
                >
                  Use Long Story
                </button>
                <button 
                  onClick={() => setCaption(currentDraft.content.shortCaption)}
                  className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg transition-colors border border-slate-200"
                >
                  Reset to Short
                </button>
             </div>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">{error}</div>}
          {success && <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 flex items-center gap-2"><CheckCircle size={18} /> {success}</div>}

          <button
            onClick={handleUpload}
            disabled={uploading || !selectedPage}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
              uploading || !selectedPage ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-[#1877F2] hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300'
            }`}
          >
            {uploading ? 'Publishing...' : <><Send size={20} /> Publish Now</>}
          </button>

        </div>
      </div>
    </div>
  );
};

export default UploadFacebook;
