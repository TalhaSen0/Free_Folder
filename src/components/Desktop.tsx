import React, { useState, useEffect } from 'react';
import FileIcon from './FileIcon';
import FolderWindow from './FolderWindow';
import { useFileSystem } from '../context/FileSystemContext';

const Desktop: React.FC = () => {
  const { desktopFiles, openFolders } = useFileSystem();
  const [gridSize, setGridSize] = useState(16); // 16x9 default
  const [showGrid, setShowGrid] = useState(false);

  // Grid dimensions (maintaining 16:9 aspect ratio)
  const getGridDimensions = () => {
    const cols = gridSize;
    const rows = Math.round(gridSize * 9 / 16);
    return { cols, rows };
  };

  const { cols, rows } = getGridDimensions();
  const cellWidth = (window.innerWidth - 32) / cols; // 32px for padding
  const cellHeight = (window.innerHeight - 80) / rows; // 80px for taskbar + padding

  // Handle zoom with Ctrl + Mouse wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        setGridSize(prev => Math.max(8, Math.min(32, prev + delta)));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        setShowGrid(!showGrid);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showGrid]);

  // Generate grid cells for visualization
  const renderGrid = () => {
    if (!showGrid) return null;
    
    const cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push(
          <div
            key={`${row}-${col}`}
            className="absolute border border-white/20 pointer-events-none"
            style={{
              left: 16 + col * cellWidth,
              top: 16 + row * cellHeight,
              width: cellWidth,
              height: cellHeight,
            }}
          />
        );
      }
    }
    return cells;
  };

  return (
    <div className="relative w-full h-full desktop-container">
      {/* Grid overlay */}
      {renderGrid()}
      
      {/* Grid info */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
        <div>Grid: {cols}×{rows}</div>
        <div>Zoom: {Math.round((16/gridSize) * 100)}%</div>
        <div className="text-xs opacity-70">Ctrl+Wheel: Zoom</div>
        <div className="text-xs opacity-70">F2: Toggle Grid</div>
      </div>

      {/* Desktop Files */}
      <div className="absolute inset-0 p-4">
        {desktopFiles.map((file) => (
          <FileIcon
            key={file.id}
            file={file}
            onDoubleClick={() => {}}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            gridCols={cols}
            gridRows={rows}
          />
        ))}
      </div>

      {/* Open Folder Windows */}
      {Object.entries(openFolders).map(([folderId, files]) => {
        const folder = desktopFiles.find(f => f.id === folderId);
        if (!folder) return null;
        
        return (
          <FolderWindow
            key={folderId}
            folder={folder}
            files={files}
          />
        );
      })}
    </div>
  );
};

export default Desktop;