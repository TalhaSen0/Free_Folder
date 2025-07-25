import React from 'react';
import { Search, Wifi, Volume2, Battery } from 'lucide-react';

const Taskbar: React.FC = () => {
  const currentTime = new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/80 backdrop-blur-sm border-t border-white/10 flex items-center justify-between px-4">
      {/* Start Button */}
      <div className="flex items-center space-x-2">
        <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors">
          <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
          </div>
          <span>Başlat</span>
        </button>
        
        <button className="p-2 hover:bg-white/10 rounded text-white">
          <Search size={16} />
        </button>
      </div>

      {/* Center - Open Applications */}
      <div className="flex items-center space-x-1">
        <div className="px-3 py-1 bg-white/10 rounded text-white text-xs">
          FreeFolder Demo
        </div>
      </div>

      {/* System Tray */}
      <div className="flex items-center space-x-3 text-white">
        <Wifi size={16} className="opacity-80" />
        <Volume2 size={16} className="opacity-80" />
        <Battery size={16} className="opacity-80" />
        <div className="text-sm">
          {currentTime}
        </div>
      </div>
    </div>
  );
};

export default Taskbar;