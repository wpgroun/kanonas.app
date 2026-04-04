'use client';

import { useState } from 'react';
import ConnectForm from './ConnectForm';
import PrayerRequestForm from './PrayerRequestForm';

export default function ConnectTabs({ slug }: { slug: string }) {
  const [activeTab, setActiveTab] = useState<'requests' | 'diptychs'>('requests');

  return (
    <div className="w-full">
      <div className="flex px-1 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Αιτήσεις & Συμμετοχές
        </button>
        <button
          onClick={() => setActiveTab('diptychs')}
          className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${
            activeTab === 'diptychs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Ονόματα Διπτύχων
        </button>
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'requests' ? <ConnectForm slug={slug} /> : <PrayerRequestForm slug={slug} />}
      </div>
    </div>
  );
}
