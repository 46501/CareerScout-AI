import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, X, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  completionPercentage: number;
  missingFields: string[];
}

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  isOpen,
  onClose,
  completionPercentage,
  missingFields
}) => {
  const navigate = useNavigate();
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to allow DOM to render before adding visible class for transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none'}`}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}
    >
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div 
        className={`relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 pb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center border border-blue-100/50 mb-6 shadow-sm">
            <Bot className="h-7 w-7 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
            Complete Your Profile
          </h2>
          <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-8 pr-4">
            Your profile is not complete yet. Complete your profile to let AI Scout find more relevant opportunities for you.
          </p>

          <div className="mb-6 bg-gray-50/50 border border-gray-100 p-4 rounded-2xl">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[13px] font-bold text-gray-900">Profile Completion</span>
              <span className="text-[13px] font-extrabold text-blue-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-5">
              <div 
                className="bg-blue-600 h-2 rounded-full relative transition-all duration-1000 ease-out" 
                style={{ width: `${completionPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20"></div>
              </div>
            </div>

            <p className="text-[12px] font-bold text-gray-500 mb-3 uppercase tracking-wider">
              Complete these sections to continue:
            </p>
            <ul className="space-y-2.5">
              {missingFields.length > 0 ? missingFields.map((field, idx) => (
                <li key={idx} className="flex items-center text-[13px] font-semibold text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2.5"></div>
                  {field}
                </li>
              )) : (
                <li className="flex items-center text-[13px] font-semibold text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2.5"></div>
                  Required Sections
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl py-2.5 h-auto font-bold text-[14px] transition-all border-0 order-1 sm:order-2"
            onClick={() => {
              onClose();
              navigate('/profile');
            }}
          >
            Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl py-2.5 h-auto font-bold text-[14px] order-2 sm:order-1"
            onClick={onClose}
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
};
