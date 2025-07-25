import React from 'react';
import { X, Minimize2, Maximize2, Folder } from 'lucide-react';
import { FileItem } from '../types';
import { useFileSystem } from '../context/FileSystemContext';
import FileIcon from './FileIcon';

interface FolderWindowProps {
  folder: FileItem;
  files: FileItem[];
}

const FolderWindow: React.FC<FolderWindowProps> = ({ folder, files }) => {
  const { closeFolder } = useFileSystem();

  const handleClose = () => {
    closeFolder(folder.id);
  };

  const isFreefolder = folder.type === 'freefolder';

  return (
    <div 
      className="absolute bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-white/20"
      style={{
        left: folder.position.x + 50,
        top: folder.position.y + 50,
        width: 600,
        height: 400,
        zIndex: 100
      }}
      data-folder-id={folder.id}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-lg border-b">
        <div className="flex items-center space-x-2">
          <div className="text-lg">
            {isFreefolder ? '🎨' : '📁'}
          </div>
          <span className="font-semibold text-gray-800">{folder.name}</span>
          {isFreefolder && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
              FreeFolder
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-1 hover:bg-gray-300 rounded">
            <Minimize2 size={14} />
          </button>
          <button className="p-1 hover:bg-gray-300 rounded">
            <Maximize2 size={14} />
          </button>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-red-500 hover:text-white rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative h-full p-4 folder-content overflow-hidden">
        {isFreefolder ? (
          // FreeFolder: Free positioning like desktop
          <div className="relative w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 rounded">
            <div className="absolute inset-2">
              {files.map((file) => (
                <FileIcon
                  key={file.id}
                  file={file}
                  onDoubleClick={() => {}}
                  containerId={folder.id}
                  cellWidth={80}
                  cellHeight={80}
                  gridCols={16}
                  gridRows={9}
                />
              ))}
            </div>
            {files.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎨</div>
                  <p>Bu FreeFolder boş</p>
                  <p className="text-sm">Dosyaları istediğiniz yere sürükleyip bırakın</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Regular Folder: List view
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
              >
                <div className="text-lg">{file.icon}</div>
                <span className="flex-1">{file.name}</span>
                <span className="text-xs text-gray-500">{file.type}</span>
              </div>
            ))}
            {files.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Folder size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Bu klasör boş</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 px-3 py-1 text-xs text-gray-600 rounded-b-lg border-t">
        {files.length} öğe {isFreefolder && '• Serbest konumlandırma aktif'}
      </div>
    </div>
  );
};

export default FolderWindow;