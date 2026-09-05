import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import clsx from 'clsx';

interface OpportunityCardProps {
  id: string;
  title: string;
  organization: string;
  logo: string;
  isNew?: boolean;
  isVerified?: boolean;
  workMode: string;
  paymentType: string;
  duration: string;
  description: string;
  skills: string[];
  postedTime: string;
  matchScore: number; // Kept for prop compatibility, but unused in new UI
  earlyApplicant?: boolean;
  isSaved?: boolean;
  onApply: (id: string, externalUrl?: string) => void;
  onSave?: (id: string) => void;
  onCardClick: (id: string) => void;
}

export default function OpportunityCard({
  id,
  title,
  organization,
  logo,
  workMode,
  paymentType,
  duration,
  skills,
  postedTime,
  isSaved = false,
  onSave,
  onCardClick
}: OpportunityCardProps) {
  
  const [imgError, setImgError] = useState(false);

  return (
    <div 
      className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group flex items-start gap-4"
      onClick={() => onCardClick(id)}
    >
      {/* Logo */}
      <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-slate-100 flex-shrink-0 flex items-center justify-center shadow-sm">
        {!imgError && logo ? (
          <img 
            src={logo} 
            alt={organization} 
            className="w-full h-full object-contain p-1" 
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="font-bold text-slate-400 text-lg">
            {organization ? organization.charAt(0).toUpperCase() : 'O'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
          {title}
        </h3>
        <p className="text-[13px] text-slate-500 mb-2 truncate">{organization}</p>
        
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {workMode}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {duration}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> {paymentType}
          </span>
          
          {/* Skills */}
          {skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-500">
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-500">
              +{skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex flex-col items-end justify-between h-full min-h-[50px] shrink-0 ml-4 gap-4">
        <button 
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-colors",
            isSaved 
              ? "border-blue-200 bg-blue-50 text-blue-600" 
              : "border-slate-200 text-blue-600 hover:bg-slate-50"
          )}
          onClick={(e) => { 
            e.stopPropagation(); 
            if(onSave) onSave(id);
          }}
        >
          <Bookmark className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <span className="text-[11px] font-medium text-slate-400">{postedTime}</span>
      </div>
    </div>
  );
}
