import React from 'react';

interface StepCardProps {
  title: string;
  image: string | null;
  isActive: boolean;
  stepNumber: number;
  rotation: string;
}

export const StepCard: React.FC<StepCardProps> = ({ title, image, isActive, stepNumber, rotation }) => {
  return (
    <div 
      className={`relative w-1/3 aspect-[3/4] transition-all duration-500 transform ${rotation} hover:z-10 hover:scale-105 hover:rotate-0 shadow-xl rounded-2xl overflow-hidden border-4 ${isActive ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-white/50'}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Background/Image */}
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-300 text-6xl font-light opacity-50">{stepNumber}</div>
        )}
      </div>
      
      {/* Overlay Label */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <h3 className="text-white font-medium text-center text-sm md:text-lg">{title}</h3>
      </div>
      
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};
