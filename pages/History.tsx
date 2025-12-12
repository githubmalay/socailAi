import React from 'react';
import { useApp } from '../context';
import { Trash2, ExternalLink, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History: React.FC = () => {
  const { history, clearHistory, setCurrentDraft } = useApp();
  const navigate = useNavigate();

  const handleUse = (item: any) => {
    setCurrentDraft(item);
    navigate('/generate'); // Or upload, but generating page shows details nicely
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">History</h1>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={18} /> Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
           <p className="text-slate-400 text-lg">No history yet. Generate a post to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="h-48 overflow-hidden relative group">
                <img src={item.image} alt="Draft" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleUse(item)}
                    className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium text-sm"
                  >
                    View & Reuse
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Calendar size={14} />
                  {new Date(item.content.timestamp).toLocaleDateString()}
                </div>
                <h3 className="font-bold text-slate-800 line-clamp-1 mb-1">{item.content.tagline}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{item.content.shortCaption}</p>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                   <span className="text-xs text-indigo-500 font-medium">Draft</span>
                   <button 
                     onClick={() => {
                       setCurrentDraft(item);
                       navigate('/upload');
                     }}
                     className="text-slate-400 hover:text-blue-600 transition-colors"
                     title="Upload directly"
                   >
                     <ExternalLink size={18} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
