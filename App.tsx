import React, { useState, useEffect } from 'react';
import { StepCard } from './components/StepCard';
import { AssetSelector } from './components/AssetSelector';
import { AppStep, ImageAsset, HistoryItem } from './types';
import { PRESET_PEOPLE, PRESET_CLOTHES } from './constants';
import { generateClothingFromText, generateTryOn } from './services/geminiService';
import { Wand2, ChevronRight, RefreshCw, Download, User, Shirt, History } from 'lucide-react';

export default function App() {
  // State
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.SELECT_PERSON);
  const [peopleAssets, setPeopleAssets] = useState<ImageAsset[]>(PRESET_PEOPLE);
  const [clothingAssets, setClothingAssets] = useState<ImageAsset[]>(PRESET_CLOTHES);
  
  const [selectedPerson, setSelectedPerson] = useState<ImageAsset | null>(null);
  const [selectedCloth, setSelectedCloth] = useState<ImageAsset | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Helpers
  const handleFileUpload = (file: File, category: 'person' | 'cloth') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const newAsset: ImageAsset = {
        id: `custom_${Date.now()}`,
        url,
        isUserUploaded: true,
        category
      };
      
      if (category === 'person') {
        setPeopleAssets(prev => [newAsset, ...prev]);
        setSelectedPerson(newAsset);
      } else {
        setClothingAssets(prev => [newAsset, ...prev]);
        setSelectedCloth(newAsset);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateClothes = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const imageUrl = await generateClothingFromText(prompt);
      const newAsset: ImageAsset = {
        id: `ai_cloth_${Date.now()}`,
        url: imageUrl,
        isUserUploaded: true, // Treated as user custom
        category: 'cloth'
      };
      setClothingAssets(prev => [newAsset, ...prev]);
      setSelectedCloth(newAsset);
    } catch (err) {
      setError("服装生成失败，请重试或检查网络。");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTryOn = async () => {
    if (!selectedPerson || !selectedCloth) return;
    
    setIsGenerating(true);
    setError(null);
    setResultImage(null);
    
    try {
      const generatedUrl = await generateTryOn(selectedPerson.url, selectedCloth.url);
      setResultImage(generatedUrl);
      
      // Add to history
      const newHistoryItem: HistoryItem = {
        id: `h_${Date.now()}`,
        personUrl: selectedPerson.url,
        clothUrl: selectedCloth.url,
        resultUrl: generatedUrl,
        timestamp: Date.now()
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      
    } catch (err) {
      setError("试穿生成失败。请确保选择了清晰的图片。");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setCurrentStep(AppStep.SELECT_PERSON);
    setSelectedPerson(null);
    setSelectedCloth(null);
    setResultImage(null);
    setError(null);
  };

  // Render logic
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-indigo-100">
      
      {/* Header / Top Dynamic Display */}
      <div className="bg-gradient-to-b from-indigo-900 to-indigo-800 pt-8 pb-16 px-4 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="max-w-5xl mx-auto">
          <header className="flex justify-between items-center mb-10 text-white relative z-10">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI 换装工作室</h1>
              <p className="text-indigo-200 text-sm">Powered by Nano Banana</p>
            </div>
            {currentStep === AppStep.GENERATE && resultImage && (
               <button onClick={reset} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur transition-all text-sm">
                 <RefreshCw className="w-4 h-4" /> 重新开始
               </button>
            )}
          </header>

          {/* 3D Cards Container */}
          <div className="flex justify-center items-center gap-4 md:gap-8 perspective-1000 max-w-2xl mx-auto h-64 md:h-80">
            <StepCard 
              title="1. 人物" 
              image={selectedPerson?.url || null} 
              isActive={currentStep === AppStep.SELECT_PERSON}
              stepNumber={1}
              rotation={currentStep === 1 ? 'rotate-0 scale-110 z-20' : '-rotate-6 scale-90 opacity-60'}
            />
            <StepCard 
              title="2. 服装" 
              image={selectedCloth?.url || null} 
              isActive={currentStep === AppStep.SELECT_CLOTH}
              stepNumber={2}
              rotation={currentStep === 2 ? 'rotate-0 scale-110 z-20' : currentStep === 1 ? 'rotate-6 scale-90 opacity-60' : '-rotate-6 scale-90 opacity-60'}
            />
            <StepCard 
              title="3. 效果" 
              image={resultImage} 
              isActive={currentStep === AppStep.GENERATE}
              stepNumber={3}
              rotation={currentStep === 3 ? 'rotate-0 scale-110 z-20' : 'rotate-6 scale-90 opacity-60'}
            />
          </div>
        </div>
      </div>

      {/* Main Operation Area */}
      <main className="-mt-8 max-w-5xl mx-auto px-4 relative z-20 pb-20">
        <div className="bg-white rounded-3xl shadow-xl min-h-[400px] p-6 md:p-8 transition-all">
          
          {/* Step Navigation Titles */}
          <div className="flex items-center gap-4 mb-8 border-b pb-4">
            <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm">1</div>
              <span>选择人物</span>
            </div>
            <ChevronRight className="text-gray-300 w-5 h-5" />
            <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm">2</div>
              <span>选择服装</span>
            </div>
            <ChevronRight className="text-gray-300 w-5 h-5" />
            <div className={`flex items-center gap-2 ${currentStep === 3 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm">3</div>
              <span>生成结果</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* Content based on Step */}
          {currentStep === AppStep.SELECT_PERSON && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="text-indigo-500" /> 选择你的模特
              </h2>
              <AssetSelector 
                assets={peopleAssets}
                selectedId={selectedPerson?.id || null}
                onSelect={(asset) => {
                  setSelectedPerson(asset);
                  // Auto advance after short delay for better UX
                  setTimeout(() => setCurrentStep(AppStep.SELECT_CLOTH), 300);
                }}
                onUpload={(file) => handleFileUpload(file, 'person')}
              />
            </div>
          )}

          {currentStep === AppStep.SELECT_CLOTH && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                  <Shirt className="text-indigo-500" /> 选择或生成服装
                </h2>
                <button onClick={() => setCurrentStep(AppStep.SELECT_PERSON)} className="text-sm text-gray-500 hover:text-indigo-600">
                  ← 返回上一步
                </button>
              </div>

              {/* Step 1 Context Preview */}
              {selectedPerson && (
                 <div className="mb-6 flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <img src={selectedPerson.url} alt="Selected Person" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                    <span className="text-sm text-gray-600">已选模特</span>
                 </div>
              )}

              <AssetSelector 
                assets={clothingAssets}
                selectedId={selectedCloth?.id || null}
                onSelect={(asset) => setSelectedCloth(asset)}
                onUpload={(file) => handleFileUpload(file, 'cloth')}
                allowGeneration={true}
                isGenerating={isGenerating}
                onGenerateRequest={handleGenerateClothes}
              />

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setCurrentStep(AppStep.GENERATE)}
                  disabled={!selectedCloth}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  下一步 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === AppStep.GENERATE && (
            <div className="animate-fade-in flex flex-col items-center">
              
              {!resultImage && !isGenerating && (
                 <div className="text-center py-12">
                   <h2 className="text-2xl font-bold text-gray-800 mb-2">准备就绪</h2>
                   <p className="text-gray-500 mb-8">即将使用 Nano Banana 模型将所选服装穿在模特身上。</p>
                   <button 
                    onClick={handleGenerateTryOn}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-300 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3"
                   >
                     <Wand2 className="w-6 h-6" /> 开始生成
                   </button>
                   <button onClick={() => setCurrentStep(AppStep.SELECT_CLOTH)} className="block mx-auto mt-6 text-gray-400 hover:text-gray-600">
                     返回修改
                   </button>
                 </div>
              )}

              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-gray-800">正在施展魔法...</h3>
                  <p className="text-gray-500 mt-2">AI 正在处理细节，请稍候</p>
                </div>
              )}

              {resultImage && (
                <div className="w-full max-w-md mx-auto">
                   <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 mb-6">
                      <img src={resultImage} alt="Generated Result" className="w-full rounded-xl" />
                   </div>
                   <div className="flex gap-4 justify-center">
                     <a 
                       href={resultImage} 
                       download={`ai-tryon-${Date.now()}.png`}
                       className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
                     >
                       <Download className="w-4 h-4" /> 保存图片
                     </a>
                     <button 
                       onClick={reset}
                       className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                     >
                       再试一次
                     </button>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gallery / History */}
        {history.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" /> 历史记录
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {history.map((item) => (
                <div key={item.id} className="bg-white p-2 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative">
                   <img src={item.resultUrl} alt="History" className="w-full aspect-[3/4] object-cover rounded-lg" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <a href={item.resultUrl} download className="p-2 bg-white rounded-full text-indigo-600 hover:scale-110 transition-transform">
                        <Download className="w-5 h-5" />
                      </a>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
