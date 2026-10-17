import React from 'react';
import { X, Briefcase, MapPin, DollarSign, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { normalizeJobDescription } from '../../lib/descriptionNormalizer';

interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: any;
  onAnalyze?: (opp: any) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onAnalyze
}) => {
  if (!isOpen || !opportunity) return null;

  const normalizedDescription = normalizeJobDescription(opportunity.description);
  const paragraphs = normalizedDescription ? normalizedDescription.split('\n\n') : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 bg-white/95 dark:bg-slate-900/95">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-start gap-4 pr-6">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
              {opportunity.organizationLogo ? (
                <img src={opportunity.organizationLogo} alt={opportunity.organization} className="w-10 h-10 object-contain" />
              ) : (
                <Briefcase className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {opportunity.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{opportunity.organization}</span>
                <span>•</span>
                <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1 text-slate-500" /> {opportunity.location || opportunity.remoteType || 'Remote'}</span>
                {opportunity.salary && (
                  <>
                    <span>•</span>
                    <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                      <DollarSign className="h-3.5 w-3.5 mr-0.5" /> {opportunity.salary}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 rounded-full p-1.5 transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300 text-sm">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Badge variant="outline" className="border-accent-500/50 text-accent-600 dark:text-accent-400 bg-accent-500/10 font-semibold">
              {opportunity.type}
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {opportunity.remoteType || 'REMOTE'}
            </Badge>
            {opportunity.source && (
              <Badge variant="secondary" className="bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-500/20">
                Source: {opportunity.source}
              </Badge>
            )}
            {opportunity.status === 'EXPIRED' && (
              <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold">
                Expired
              </Badge>
            )}
            {opportunity.deadline && (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
              </span>
            )}
            {opportunity.postedAt && (
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center ml-auto">
                <Clock className="h-3 w-3 mr-1" />
                Posted {new Date(opportunity.postedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* AI Match Overview if available */}
          {opportunity.matchDetails && (
            <div className="bg-primary-900/15 border border-primary-500/25 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary-500" />
                  <span className="font-bold text-slate-900 dark:text-white">AI Match Score: {opportunity.matchDetails.score}%</span>
                </div>
                {onAnalyze && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs border-primary-500/30 text-primary-700 dark:text-primary-300"
                    onClick={() => {
                      onClose();
                      onAnalyze(opportunity);
                    }}
                  >
                    View Match Analysis
                  </Button>
                )}
              </div>
              {opportunity.matchDetails.reasons?.length > 0 && (
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc ml-4">
                  {opportunity.matchDetails.reasons.slice(0, 2).map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Job Description Body */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Job Description</h3>
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => {
                const trimmed = para.trim();
                if (!trimmed) return null;

                // Check if paragraph is a list of bullet points
                if (trimmed.startsWith('•') || trimmed.includes('\n•')) {
                  const items = trimmed.split('\n').filter(Boolean);
                  return (
                    <ul key={idx} className="space-y-1.5 pl-2">
                      {items.map((item, itemIdx) => (
                        <li key={itemIdx} className="leading-relaxed flex items-start gap-2">
                          <span className="text-primary-500 font-bold">•</span>
                          <span>{item.replace(/^[•\s*-]+/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p key={idx} className="leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
                    {trimmed}
                  </p>
                );
              })
            ) : (
              <p className="text-slate-500 italic">No description provided for this role.</p>
            )}
          </div>

          {/* Required Skills */}
          {opportunity.skills && opportunity.skills.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                Required Skills & Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {opportunity.skills.map((s: string) => (
                  <Badge key={s} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-3">
            {onAnalyze && (
              <Button 
                variant="outline" 
                onClick={() => {
                  onClose();
                  onAnalyze(opportunity);
                }}
                className="hidden sm:inline-flex"
              >
                <Sparkles className="h-4 w-4 mr-2 text-primary-500" /> Analyze Fit
              </Button>
            )}
            <Button 
              className="bg-primary-600 hover:bg-primary-500 text-white shadow-md font-semibold"
              onClick={() => {
                window.open(opportunity.applicationUrl || opportunity.sourceUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              Apply Now <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
