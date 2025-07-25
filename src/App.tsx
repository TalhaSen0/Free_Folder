import React from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import { FileSystemProvider } from './context/FileSystemContext';

function App() {
  return (
    <FileSystemProvider>
      <div className="h-screen w-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        <Desktop />
        <Taskbar />
      </div>
    </FileSystemProvider>
  );
}

export default App;