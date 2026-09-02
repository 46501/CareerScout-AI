import { X, ExternalLink } from 'lucide-react';

interface OpportunityDetailProps {
  opp: any;
  onClose: () => void;
  onApply: (id: string, externalUrl?: string) => void;
}

export default function OpportunityDetail({ opp, onClose, onApply }: OpportunityDetailProps) {
  if (!opp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card-color w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-border-color">
          <h2 className="text-xl font-semibold text-text-color">{opp.title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-text-color rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 text-sm text-text-color space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-100 p-2 shrink-0">
              <img src={opp.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(opp.organization)}&background=random`} alt={opp.organization} className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{opp.organization}</h3>
              <p className="text-gray-500">{opp.workMode} • {opp.paymentType} • {opp.duration}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-primary">AI Match Analysis ({opp.matchScore}%)</h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-blue-900 dark:text-blue-100">
              <p>{opp.matchExplanation?.explanation || 'No detailed analysis available.'}</p>
              
              {opp.matchExplanation?.missingSkills && opp.matchExplanation.missingSkills.length > 0 && (
                <div className="mt-3">
                  <span className="font-semibold text-sm">Skills to improve: </span>
                  {opp.matchExplanation.missingSkills.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{opp.description}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {opp.skills?.map((s: string) => (
                <span key={s} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border-color flex justify-end gap-3 bg-gray-50 dark:bg-gray-900">
          <button onClick={onClose} className="px-5 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            Close
          </button>
          <button 
            onClick={() => onApply(opp._id, opp.applicationUrl)}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
