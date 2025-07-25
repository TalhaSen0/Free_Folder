import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FileItem } from '../types';

interface FileSystemContextType {
  desktopFiles: FileItem[];
  openFolders: { [key: string]: FileItem[] };
  setDesktopFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  setOpenFolders: React.Dispatch<React.SetStateAction<{ [key: string]: FileItem[] }>>;
  updateFilePosition: (fileId: string, position: { x: number; y: number }, containerId?: string) => void;
  openFolder: (folder: FileItem) => void;
  closeFolder: (folderId: string) => void;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

const initialFiles: FileItem[] = [
  {
    id: '1',
    name: 'Oyun Projem',
    type: 'freefolder',
    icon: '🎮',
    position: { x: 96, y: 96 }, // Snapped to grid (1,1)
    content: [
      { id: '1-1', name: 'karakter.png', type: 'file', icon: '🖼️', position: { x: 50, y: 50 } },
      { id: '1-2', name: 'silah.png', type: 'file', icon: '🖼️', position: { x: 200, y: 80 } },
      { id: '1-3', name: 'harita.png', type: 'file', icon: '🗺️', position: { x: 350, y: 120 } },
      { id: '1-4', name: 'ses_efektleri', type: 'folder', icon: '🔊', position: { x: 100, y: 200 } },
      { id: '1-5', name: 'kodlar.js', type: 'file', icon: '📄', position: { x: 300, y: 250 } },
    ]
  },
  {
    id: '2',
    name: 'Belgelerim',
    type: 'folder',
    icon: '📁',
    position: { x: 176, y: 96 }, // Snapped to grid (2,1)
    content: []
  },
  {
    id: '3',
    name: 'Fotoğraflar',
    type: 'freefolder',
    icon: '📸',
    position: { x: 256, y: 96 }, // Snapped to grid (3,1)
    content: [
      { id: '3-1', name: 'tatil1.jpg', type: 'file', icon: '🖼️', position: { x: 80, y: 60 } },
      { id: '3-2', name: 'tatil2.jpg', type: 'file', icon: '🖼️', position: { x: 220, y: 90 } },
      { id: '3-3', name: 'aile.jpg', type: 'file', icon: '🖼️', position: { x: 150, y: 180 } },
    ]
  },
  {
    id: '4',
    name: 'müzik.mp3',
    type: 'file',
    icon: '🎵',
    position: { x: 96, y: 176 } // Snapped to grid (1,2)
  },
  {
    id: '5',
    name: 'video.mp4',
    type: 'file',
    icon: '🎬',
    position: { x: 176, y: 176 } // Snapped to grid (2,2)
  }
];

export const FileSystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [desktopFiles, setDesktopFiles] = useState<FileItem[]>(initialFiles);
  const [openFolders, setOpenFolders] = useState<{ [key: string]: FileItem[] }>({});

  const updateFilePosition = (fileId: string, position: { x: number; y: number }, containerId?: string) => {
    if (containerId) {
      // Update file position within a folder
      setOpenFolders(prev => ({
        ...prev,
        [containerId]: prev[containerId]?.map(file =>
          file.id === fileId ? { ...file, position } : file
        ) || []
      }));
      
      // Also update in desktop files if it's a folder content
      setDesktopFiles(prev =>
        prev.map(file => {
          if (file.id === containerId && file.content) {
            return {
              ...file,
              content: file.content.map(subFile =>
                subFile.id === fileId ? { ...subFile, position } : subFile
              )
            };
          }
          return file;
        })
      );
    } else {
      // Update desktop file position
      setDesktopFiles(prev =>
        prev.map(file =>
          file.id === fileId ? { ...file, position } : file
        )
      );
    }
  };

  const openFolder = (folder: FileItem) => {
    if (folder.content) {
      setOpenFolders(prev => ({
        ...prev,
        [folder.id]: folder.content || []
      }));
    }
  };

  const closeFolder = (folderId: string) => {
    setOpenFolders(prev => {
      const newFolders = { ...prev };
      delete newFolders[folderId];
      return newFolders;
    });
  };

  return (
    <FileSystemContext.Provider value={{
      desktopFiles,
      openFolders,
      setDesktopFiles,
      setOpenFolders,
      updateFilePosition,
      openFolder,
      closeFolder
    }}>
      {children}
    </FileSystemContext.Provider>
  );
};