import React from 'react';
import { useApp } from '../context';
import { Facebook, CheckCircle, XCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { fbUser, selectedPage } = useApp();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Facebook className="text-blue-600" size={24} /> 
          Facebook Connection
        </h2>
        
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${fbUser ? 'bg-green-500' : 'bg-red-400'}`}></div>
                    <span className="font-medium text-slate-700">Account Status</span>
                </div>
                <span className="text-sm text-slate-500">{fbUser ? `Connected as ${fbUser.name}` : 'Not Connected'}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${selectedPage ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <span className="font-medium text-slate-700">Active Page</span>
                </div>
                <span className="text-sm text-slate-500">{selectedPage ? selectedPage.name : 'None Selected'}</span>
            </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
                To switch accounts or pages, please go to the <strong>Upload to Facebook</strong> page.
            </p>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        <p>App Version 1.1.0 • Powered by Google Gemini</p>
      </div>
    </div>
  );
};

export default Settings;