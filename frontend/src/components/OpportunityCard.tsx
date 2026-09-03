import { useState } from 'react';
import { Bookmark, Clock, MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react';
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
  matchScore: number;
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
  isNew,
  isVerified,
  workMode,
  paymentType,
  duration,
  description,
  skills,
  postedTime,
  matchScore,
  earlyApplicant,
  isSaved = false,
  onApply,
  onSave,
  onCardClick
}: OpportunityCardProps) {
  
  const [imgError, setImgError] = useState(false);
  
  // Calculate stroke dasharray for the circular progress (circumference = 2 * pi * r)
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (matchScore / 100) * circumference;

  // Strip HTML tags for clean text rendering
  const cleanDescription = description ? description.replace(/<[^>]*>?/gm, '') : '';

  return (
    <div 
      className="bg-card-color border border-border-color rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer group"
      onClick={() => onCardClick(id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex-shrink-0 flex items-center justify-center">
            {!imgError && logo ? (
              <img 
                src={logo} 
                alt={organization} 
                className="w-full h-full object-contain p-1" 
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="font-bold text-gray-400 dark:text-gray-500 text-lg">
                {organization ? organization.charAt(0).toUpperCase() : 'O'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-text-color group-hover:text-primary transition-colors">{title}</h3>
              {isNew && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  New
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-3">
              <span>{organization}</span>
              {isVerified && (
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {workMode}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {paymentType}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {duration}
              </div>
            </div>
          </div>
        </div>

        {/* Right side interactions */}
        <div className="flex flex-col items-end justify-between h-full min-h-[120px]">
          <button 
            className={clsx("transition-colors p-1", isSaved ? "text-primary" : "text-gray-400 hover:text-primary")} 
            onClick={(e) => { 
              e.stopPropagation(); 
              if(onSave) onSave(id);
            }}
          >
            <Bookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                <circle 
                  cx="32" cy="32" r={radius} 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset} 
                  className={clsx(
                    matchScore >= 90 ? 'text-green-500' : matchScore >= 70 ? 'text-blue-500' : 'text-yellow-500'
                  )} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-text-color">{matchScore}%</span>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 mt-1">Match Score</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 pr-20">
        {cleanDescription}
      </p>

      <div className="flex items-center gap-2 mb-5">
        {skills.slice(0, 4).map((skill, i) => (
          <span key={i} className="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
            {skill}
          </span>
        ))}
        {skills.length > 4 && (
          <span className="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
            +{skills.length - 4}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border-color">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500">
            <Clock className="w-3.5 h-3.5" />
            {postedTime}
          </div>
          {earlyApplicant && (
            <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Be an early applicant
            </div>
          )}
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onApply(id);
          }}
          className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          Apply Now
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
