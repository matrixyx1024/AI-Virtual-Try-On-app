import React, { useRef } from 'react';
import { ImageAsset } from '../types';
import { Upload, Camera, Sparkles } from 'lucide-react';

interface AssetSelectorProps {
  assets: ImageAsset[];
  selectedId: string | null;
  onSelect: (asset: ImageAsset) => void;
  onUpload: (file: File) => void;
  onGenerateRequest?: (prompt: string) => void;
  isGenerating?: boolean;
  allowGeneration?: boolean;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({ 
  assets, 
  selectedId, 
  onSelect, 
  onUpload, 
  onGenerateRequest,
  isGenerating,
  allowGeneration
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = React.useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleGenerate = () => {
    if (prompt.trim() && onGenerateRequest) {
      onGenerateRequest(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Generation Input (Only for clothes/Step 2) */}
      {allowGeneration && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            AI 生成服装 (Nano Banana)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想要的衣服 (例如: 红色丝绸晚礼服)"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? '生成中...' : '生成'}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Upload Button */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
          <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mb-2" />
          <span className="text-sm text-gray-500 group-hover:text-indigo-600 font-medium">上传照片</span>
        </div>

        {/* Asset List */}
        {assets.map((asset) => (
          <div 
            key={asset.id}
            onClick={() => onSelect(asset)}
            className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 ${selectedId === asset.id ? 'ring-4 ring-indigo-500 ring-offset-2' : 'hover:shadow-lg'}`}
          >
            <img 
              src={asset.url} 
              alt="Asset" 
              className="w-full h-full object-cover" 
            />
            {selectedId === asset.id && (
              <div className="absolute inset-0 bg-indigo-900/10 flex items-center justify-center">
                <div className="bg-white rounded-full p-1 shadow-md">
                   <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                </div>
              </div>
            )}
            {asset.isUserUploaded && (
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                Custom
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
