import React, { useState, useRef } from 'react';
import { FileItem } from '../types';
import { useFileSystem } from '../context/FileSystemContext';

interface FileIconProps {
  file: FileItem;
  onDoubleClick: () => void;
  containerId?: string;
  cellWidth?: number;
  cellHeight?: number;
  gridCols?: number;
  gridRows?: number;
}

const FileIcon: React.FC<FileIconProps> = ({ 
  file, 
  onDoubleClick, 
  containerId,
  cellWidth = 80,
  cellHeight = 80,
  gridCols = 16,
  gridRows = 9
}) => {
  const { updateFilePosition, openFolder, desktopFiles } = useFileSystem();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  // Get all files in the current container
  const getAllFiles = () => {
    if (containerId) {
      // For folder contents, we'd need to get them from context
      // For now, return empty array for folders
      return [];
    }
    return desktopFiles;
  };

  // Convert position to grid coordinates
  const positionToGrid = (pos: { x: number; y: number }) => {
    const col = Math.round((pos.x - 16) / cellWidth);
    const row = Math.round((pos.y - 16) / cellHeight);
    return { col, row };
  };

  // Convert grid coordinates to position
  const gridToPosition = (col: number, row: number) => {
    return {
      x: col * cellWidth + 16,
      y: row * cellHeight + 16
    };
  };

  // Check if a grid cell is occupied by another file
  const isCellOccupied = (col: number, row: number, excludeFileId?: string) => {
    const files = getAllFiles();
    return files.some(f => {
      if (f.id === excludeFileId) return false;
      const fileGrid = positionToGrid(f.position);
      return fileGrid.col === col && fileGrid.row === row;
    });
  };

  // Find next available position using chain displacement
  const findAvailablePosition = (targetCol: number, targetRow: number, draggedFileId: string) => {
    // If target position is free, use it
    if (!isCellOccupied(targetCol, targetRow, draggedFileId)) {
      return { col: targetCol, row: targetRow };
    }

    // Find the file at target position
    const files = getAllFiles();
    const fileAtTarget = files.find(f => {
      if (f.id === draggedFileId) return false;
      const fileGrid = positionToGrid(f.position);
      return fileGrid.col === targetCol && fileGrid.row === targetRow;
    });

    if (!fileAtTarget) {
      return { col: targetCol, row: targetRow };
    }

    // Determine displacement direction based on drag direction
    const draggedFile = files.find(f => f.id === draggedFileId);
    if (!draggedFile) {
      return { col: targetCol, row: targetRow };
    }

    const draggedGrid = positionToGrid(draggedFile.position);
    
    // Calculate displacement direction
    let displaceCol = targetCol;
    let displaceRow = targetRow;

    // Horizontal displacement
    if (draggedGrid.col < targetCol) {
      // Dragged from left to right, displace right
      displaceCol = targetCol + 1;
    } else if (draggedGrid.col > targetCol) {
      // Dragged from right to left, displace left
      displaceCol = targetCol - 1;
    }
    // Vertical displacement
    else if (draggedGrid.row < targetRow) {
      // Dragged from top to bottom, displace down
      displaceRow = targetRow + 1;
    } else if (draggedGrid.row > targetRow) {
      // Dragged from bottom to top, displace up
      displaceRow = targetRow - 1;
    } else {
      // Same position, displace right by default
      displaceCol = targetCol + 1;
    }

    // Ensure displacement is within bounds
    displaceCol = Math.max(0, Math.min(gridCols - 1, displaceCol));
    displaceRow = Math.max(0, Math.min(gridRows - 1, displaceRow));

    // Chain displacement: move the displaced file
    const chainDisplacement = (col: number, row: number, movedFiles: Set<string> = new Set()): void => {
      if (movedFiles.has(`${col}-${row}`)) return; // Prevent infinite loops
      
      const fileToDisplace = files.find(f => {
        if (movedFiles.has(f.id)) return false;
        const fileGrid = positionToGrid(f.position);
        return fileGrid.col === col && fileGrid.row === row;
      });

      if (fileToDisplace) {
        movedFiles.add(fileToDisplace.id);
        movedFiles.add(`${col}-${row}`);
        
        // Find next position for displaced file
        let nextCol = col;
        let nextRow = row;
        
        // Try to move in the same direction
        if (displaceCol > targetCol) nextCol = col + 1;
        else if (displaceCol < targetCol) nextCol = col - 1;
        else if (displaceRow > targetRow) nextRow = row + 1;
        else if (displaceRow < targetRow) nextRow = row - 1;
        else nextCol = col + 1; // Default right
        
        // Ensure within bounds
        nextCol = Math.max(0, Math.min(gridCols - 1, nextCol));
        nextRow = Math.max(0, Math.min(gridRows - 1, nextRow));
        
        // Recursively displace if needed
        chainDisplacement(nextCol, nextRow, movedFiles);
        
        // Move the displaced file
        const newPosition = gridToPosition(nextCol, nextRow);
        updateFilePosition(fileToDisplace.id, newPosition, containerId);
      }
    };

    // Start chain displacement
    chainDisplacement(displaceCol, displaceRow);

    return { col: targetCol, row: targetRow };
  };

  // Snap to grid function
  const snapToGrid = (x: number, y: number) => {
    if (containerId) {
      // For folder contents, use free positioning
      return { x, y };
    }
    
    // For desktop, snap to grid
    const col = Math.round(x / cellWidth);
    const row = Math.round(y / cellHeight);
    
    // Ensure within bounds
    const clampedCol = Math.max(0, Math.min(gridCols - 1, col));
    const clampedRow = Math.max(0, Math.min(gridRows - 1, row));
    
    // Handle collisions and find available position
    const availablePos = findAvailablePosition(clampedCol, clampedRow, file.id);
    
    return gridToPosition(availablePos.col, availablePos.row);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      // Double click
      if (file.type === 'folder' || file.type === 'freefolder') {
        openFolder(file);
      }
      return;
    }

    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const container = containerId 
      ? document.querySelector(`[data-folder-id="${containerId}"] .folder-content`)
      : document.querySelector('.desktop-container') || document.body;
    
    const containerRect = container.getBoundingClientRect();
    
    const rawX = e.clientX - containerRect.left - dragOffset.x - 16; // Account for padding
    const rawY = e.clientY - containerRect.top - dragOffset.y - 16;
    
    const snapped = snapToGrid(rawX, rawY);

    updateFilePosition(file.id, { x: snapped.x + 16, y: snapped.y + 16 }, containerId);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const getFileTypeColor = () => {
    switch (file.type) {
      case 'freefolder':
        return 'bg-gradient-to-br from-purple-500 to-pink-500';
      case 'folder':
        return 'bg-gradient-to-br from-yellow-400 to-orange-500';
      default:
        return 'bg-gradient-to-br from-blue-400 to-blue-600';
    }
  };

  // Calculate icon size based on cell size
  const iconSize = Math.min(cellWidth * 0.6, cellHeight * 0.6, 64);
  const fontSize = Math.max(iconSize * 0.4, 16);

  return (
    <div
      ref={dragRef}
      className={`absolute cursor-pointer select-none file-item ${isDragging ? 'dragging' : ''}`}
      style={{
        left: file.position.x,
        top: file.position.y,
        zIndex: isDragging ? 1000 : 1,
        width: cellWidth,
        height: cellHeight
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex flex-col items-center justify-center h-full p-1 rounded-lg hover:bg-white/10 transition-all duration-200">
        <div 
          className={`rounded-xl ${getFileTypeColor()} flex items-center justify-center shadow-lg`}
          style={{
            width: iconSize,
            height: iconSize,
            fontSize: fontSize
          }}
        >
          {file.icon}
        </div>
        <span 
          className="text-white text-center truncate bg-black/30 px-1 py-0.5 rounded mt-1"
          style={{ 
            fontSize: Math.max(cellWidth * 0.12, 10),
            maxWidth: cellWidth - 8
          }}
        >
          {file.name}
        </span>
        {file.type === 'freefolder' && (
          <div 
            className="text-purple-300 font-semibold"
            style={{ fontSize: Math.max(cellWidth * 0.1, 8) }}
          >
            FreeFolder
          </div>
        )}
      </div>
    </div>
  );
};

export default FileIcon;