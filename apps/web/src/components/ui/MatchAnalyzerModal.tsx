import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Lightbulb, XCircle, FileText, Loader2, Copy } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

import api from '../../lib/api';

interface MatchAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: any;
}

export const MatchAnalyzerModal: React.FC<MatchAnalyzerModalProps> = ({ isOpen, onClose, opportunity }) => {
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  if (!isOpen || !opportunity) return null;

  const match = opportunity.matchDetails;
  
  if (!match) return null;

  const handleGenerateCoverLetter = async () => {
    setGenerating(true);
    try {
      const res = await api.post(`/opportunities/${opportunity._id}/cover-letter`);
      setCoverLetter(res.data.data.coverLetter);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/50 flex justify-between items-start bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="bg-primary-900/30 text-primary-400 p-1.5 rounded-lg border border-primary-500/20">
                <CheckCircle className="h-5 w-5" />
              </span>
              AI Match Analysis
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Analysis for <span className="font-semibold text-slate-300">{opportunity.title}</span> at {opportunity.organization}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full p-1.5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 hide-scrollbar flex-1">
          
          {/* Score Header */}
          <div className="flex flex-col md:flex-row items-center gap-6 p-5 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="12" />
                <circle 
                  cx="50" cy="50" r="42" fill="none" 
                  stroke={match.score >= 70 ? '#10b981' : match.score >= 40 ? '#f59e0b' : '#ef4444'} 
                  strokeWidth="12" 
                  strokeDasharray="264" 
                  strokeDashoffset={264 - (264 * match.score) / 100} 
                  className="transition-all duration-1000 ease-out" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute text-2xl font-extrabold text-white">{match.score}%</div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {match.score >= 80 ? 'Excellent Match!' : match.score >= 50 ? 'Good Potential' : 'It\'s a Stretch'}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Based on our semantic analysis of your resume and this job description, here is a detailed breakdown of why this opportunity was recommended for you.
              </p>
            </div>
          </div>

          {/* Reasons for Match */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-400" /> Why you're a fit
            </h4>
            <div className="space-y-3">
              {(match.reasons || []).map((reason: string, i: number) => (
                <div key={i} className="bg-green-900/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-200/80">
                  {reason}
                </div>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          {match.missingSkills && match.missingSkills.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-yellow-500" /> Skill Gaps
              </h4>
              <div className="flex flex-wrap gap-2">
                {match.missingSkills.map((skill: string, i: number) => (
                  <Badge key={i} className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1.5 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" /> {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          {match.recommendation && (
            <div>
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-accent-400" /> AI Recommendation
              </h4>
              <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-4">
                <p className="text-sm text-accent-200/90 leading-relaxed italic">
                  "{match.recommendation}"
                </p>
              </div>
            </div>
          )}

          {/* Cover Letter Section */}
          <div className="pt-4 border-t border-slate-800/50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" /> Auto-Generated Cover Letter
              </h4>
              {!coverLetter && (
                <Button 
                  onClick={handleGenerateCoverLetter} 
                  disabled={generating}
                  className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg text-xs h-8"
                >
                  {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                  Generate Letter
                </Button>
              )}
            </div>

            {coverLetter && (
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4 relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800"
                  onClick={() => navigator.clipboard.writeText(coverLetter)}
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <div className="whitespace-pre-wrap text-sm text-slate-300 font-serif leading-relaxed">
                  {coverLetter}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800/50 bg-slate-900/50 flex justify-end gap-3">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={onClose}>
            Close
          </Button>
          <Button 
            className="bg-primary-600 hover:bg-primary-500 text-white border-0 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            onClick={() => window.open(opportunity.applicationUrl, '_blank')}
          >
            Apply Now
          </Button>
        </div>

      </div>
    </div>
  );
};
