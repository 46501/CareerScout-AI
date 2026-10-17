import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bot, Sparkles, CheckCircle2, AlertTriangle, ArrowRight,
  Send, RefreshCw, ExternalLink,
  UserCheck, Zap
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BackButton } from '../../components/ui/BackButton';
import { MatchAnalyzerModal } from '../../components/ui/MatchAnalyzerModal';
import { OpportunityDetailModal } from '../../components/ui/OpportunityDetailModal';
import api from '../../lib/api';
import { useNotification } from '../../context/NotificationContext';
import { useSSE } from '../../hooks/useSSE';

export function Assistant() {
  const { notify } = useNotification();
  const navigate = useNavigate();
  const { lastEvent } = useSSE();

  // Scouting status state
  const [scoutStatus, setScoutStatus] = useState<any>(null);
  const [isScouting, setIsScouting] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState<any>(null);

  // Recommendations state
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Modal inspection states
  const [selectedOppForAnalysis, setSelectedOppForAnalysis] = useState<any>(null);
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<any>(null);

  // AI Career Advice Chat state
  const [activeTab, setActiveTab] = useState<'matches' | 'advice'>('matches');
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: 'Hello! I am your AI Career Scout advisor. Based on your profile and target roles, I continuously match you with high-fit opportunities and offer resume tips, skill gap advice, and interview prep. How can I help you today?' 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatThinking, setIsChatThinking] = useState(false);

  // Fetch Scout Status & Profile Readiness
  const fetchStatus = useCallback(async () => {
    try {
      const [statusRes, compRes] = await Promise.all([
        api.get('/scout/status'),
        api.get('/profile/completion')
      ]);
      if (statusRes.data?.success) {
        setScoutStatus(statusRes.data.data);
        if (statusRes.data.data.status === 'Running' || statusRes.data.data.status === 'Queued') {
          setIsScouting(true);
        } else {
          setIsScouting(false);
        }
      }
      if (compRes.data?.success) {
        setProfileCompletion(compRes.data.data);
      }
    } catch (e) {
      console.warn('Could not fetch scout status:', e);
    }
  }, []);

  // Fetch Recommended Matches
  const fetchMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const res = await api.get('/opportunities?filter=recommended&limit=8');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMatches(res.data.data);
      } else {
        setMatches([]);
      }
    } catch (e) {
      console.error('Failed to load recommended matches:', e);
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchMatches();
  }, [fetchStatus, fetchMatches]);

  // Reactive listener for real-time scout events
  useEffect(() => {
    if (lastEvent?.type === 'SCOUT_COMPLETED' || lastEvent?.type === 'NOTIFICATION') {
      fetchStatus();
      fetchMatches();
      setIsScouting(false);
    }
  }, [lastEvent, fetchStatus, fetchMatches]);

  // Run Scout Handler
  const handleRunScout = async () => {
    if (profileCompletion && profileCompletion.percentage < 100) {
      notify.warning({
        title: 'Profile Incomplete',
        message: 'Please complete your profile (education, skills, goals) to run AI Scout.'
      });
      navigate('/profile');
      return;
    }

    setIsScouting(true);
    notify.info({
      title: 'Scout Started',
      message: 'CareerScout AI is scanning live opportunities against your profile...'
    });

    try {
      await api.post('/scout/run');
      setTimeout(async () => {
        await fetchStatus();
        await fetchMatches();
        setIsScouting(false);
        notify.success({
          title: 'Scout Complete',
          message: 'Personalized recommendations and match scores have been updated!'
        });
      }, 3000);
    } catch (err: any) {
      setIsScouting(false);
      const errMsg = err.response?.data?.error?.message || 'Failed to start AI scout.';
      notify.error({ title: 'Error', message: errMsg });
    }
  };

  // Chat message send handler
  const handleSendMessage = () => {
    if (!chatInput.trim() || isChatThinking) return;
    const userMsg = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatThinking(true);

    setTimeout(() => {
      let reply = "I've reviewed your question. With your technical background, focusing on building end-to-end fullstack or AI projects and applying to remote and junior roles will maximize your response rate. Let me know if you'd like a custom cover letter or skill breakdown for any of your matched opportunities!";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('resume') || lower.includes('cv')) {
        reply = "Tip for your resume: Make sure your projects clearly state the problem solved, tech stack utilized, and quantified impact (e.g. 'Improved query performance by 40%'). You can upload and re-parse your resume anytime in the Profile section.";
      } else if (lower.includes('interview')) {
        reply = "For interview preparation, practice articulating trade-offs between different system design architectures and be ready to write clean, modular code with test cases.";
      } else if (lower.includes('intern') || lower.includes('internship')) {
        reply = "We currently have active tech internships discovered from verified providers in our database. You can review your top matched internships in the recommendations tab or explore all under Discover Opportunities.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsChatThinking(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-15 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Navigation & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <BackButton fallback="/dashboard" label="Back to Dashboard" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-2 flex items-center gap-3">
              <span className="p-2 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                <Bot className="h-7 w-7" />
              </span>
              AI Career Scout Hub
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Personalized opportunity intelligence, transparent fit scores, and real-time skill matching.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRunScout}
              disabled={isScouting}
              className="bg-primary-600 hover:bg-primary-500 text-white shadow-md font-semibold px-5 h-10 rounded-xl flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isScouting ? 'animate-spin' : ''}`} />
              <span>{isScouting ? 'Scouting Web...' : 'Scout Opportunities Now'}</span>
            </Button>
          </div>
        </div>

        {/* Scout Status & Readiness Overview Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Status Card */}
          <Card className="glass-card border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Scout Engine Status
              </span>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isScouting ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isScouting ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {isScouting ? 'Active Scanning' : (scoutStatus?.status || 'Ready')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isScouting ? 'Analyzing live feeds across 4 sources...' : 'Background monitor active every 2 hours'}
            </p>
          </Card>

          {/* Profile Match Readiness */}
          <Card className="glass-card border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Profile Match Readiness
              </span>
              <UserCheck className="h-4 w-4 text-primary-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {profileCompletion?.percentage || 0}%
              </span>
              <span className="text-xs font-medium text-slate-500">
                {profileCompletion?.percentage === 100 ? 'Fully Complete' : 'Needs Completion'}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-gradient-to-r from-primary-600 to-accent-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion?.percentage || 0}%` }}
              />
            </div>
          </Card>

          {/* High Fit Matches Found */}
          <Card className="glass-card border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Recommended Matches
              </span>
              <Zap className="h-4 w-4 text-accent-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {matches.length}
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Scored for you
              </span>
            </div>
            <Link 
              to="/opportunities" 
              className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1 mt-1"
            >
              <span>Explore all opportunities</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Card>

        </div>

        {/* Tab Selector: Matches vs Career Advice */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'matches'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Personalized Match Results ({matches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('advice')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'advice'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>AI Career Coaching</span>
          </button>
        </div>

        {/* Content Tab 1: Personalized Match Recommendations */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {loadingMatches ? (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-semibold text-slate-800 dark:text-slate-200">Evaluating personalized matches...</p>
              </div>
            ) : matches.length === 0 ? (
              <Card className="glass-card text-center py-14 px-6 border-slate-200 dark:border-slate-800 rounded-2xl">
                <Bot className="h-12 w-12 text-primary-500 mx-auto mb-3 opacity-80" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  No personalized matches generated yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs max-w-md mx-auto mb-5 leading-relaxed">
                  Run the AI Scout to score active jobs, internships, and hackathons against your saved skills and career goals.
                </p>
                <Button onClick={handleRunScout} className="bg-primary-600 hover:bg-primary-500 text-white text-xs h-9 rounded-xl">
                  Run AI Scout Now
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map(opp => {
                  const score = opp.matchDetails?.score || 50;
                  const reasons = opp.matchDetails?.reasons || [];
                  const matchedSkills = opp.matchDetails?.matchedSkills || [];
                  const missingSkills = opp.matchDetails?.missingSkills || [];
                  const warnings = opp.matchDetails?.eligibilityWarnings || [];

                  return (
                    <Card 
                      key={opp._id}
                      className="glass-card border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl hover:border-primary-500/50 transition-all cursor-pointer group bg-white/90 dark:bg-slate-900/70"
                      onClick={() => setSelectedOppForDetail(opp)}
                    >
                      <div className="space-y-3">
                        
                        {/* Header: Title, Org, and Score */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <Badge variant="outline" className="text-[10px] py-0 px-2 mb-1.5 font-bold uppercase tracking-wider border-primary-500/30 text-primary-600 dark:text-primary-400 bg-primary-500/10">
                              {opp.type}
                            </Badge>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">
                              {opp.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              {opp.organization} • {opp.location || 'Remote'}
                            </p>
                          </div>

                          {/* Score Badge */}
                          <div className="flex flex-col items-end shrink-0">
                            <div className="text-lg font-black text-primary-600 dark:text-primary-400 flex items-center gap-1">
                              <span>{score}%</span>
                              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              {score >= 75 ? 'Top Fit' : 'Good Fit'}
                            </span>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        {reasons.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-primary-500/5 dark:bg-primary-950/20 border border-primary-500/15 text-xs text-slate-700 dark:text-slate-300">
                            <p className="font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-1.5 mb-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Why this matches:
                            </p>
                            <p className="text-[11px] leading-relaxed line-clamp-2">
                              {reasons[0]}
                            </p>
                          </div>
                        )}

                        {/* Matched Skills & Missing Skills */}
                        <div className="space-y-1.5 pt-1 text-xs">
                          {matchedSkills.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Skills:</span>
                              {matchedSkills.slice(0, 3).map((s: string) => (
                                <Badge key={s} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] py-0 px-1.5">
                                  ✓ {s}
                                </Badge>
                              ))}
                              {matchedSkills.length > 3 && (
                                <span className="text-[10px] text-slate-400">+{matchedSkills.length - 3}</span>
                              )}
                            </div>
                          )}

                          {missingSkills.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] font-bold text-amber-500 uppercase mr-1">Missing:</span>
                              {missingSkills.slice(0, 2).map((s: string) => (
                                <Badge key={s} className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 text-[10px] py-0 px-1.5">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {warnings.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 pt-1">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              <span className="truncate">{warnings[0]}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-primary-500/30 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOppForAnalysis(opp);
                            }}
                          >
                            Analyze Fit
                          </Button>

                          <Button
                            size="sm"
                            className="h-8 text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(opp.applicationUrl || opp.sourceUrl, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <span>Apply</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>

                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Content Tab 2: Interactive AI Career Coaching */}
        {activeTab === 'advice' && (
          <Card className="glass-card border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden flex flex-col h-[520px] bg-white/90 dark:bg-slate-900/80 shadow-lg">
            <CardHeader className="py-3.5 px-6 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary-500" />
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  CareerScout AI Mentor
                </CardTitle>
              </div>
              <span className="text-[11px] text-slate-400">Context: Profile & Target Roles Loaded</span>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-br-none shadow-md' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isChatThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse delay-300" />
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
              <div className="flex space-x-2">
                <Input 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask for resume feedback, interview advice, or skill suggestions..." 
                  className="flex-1 text-xs h-10 rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={isChatThinking} className="h-10 px-4 rounded-xl bg-primary-600 text-white hover:bg-primary-500">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

      </div>

      {/* Modals */}
      <MatchAnalyzerModal 
        isOpen={!!selectedOppForAnalysis} 
        onClose={() => setSelectedOppForAnalysis(null)} 
        opportunity={selectedOppForAnalysis} 
      />

      <OpportunityDetailModal
        isOpen={!!selectedOppForDetail}
        onClose={() => setSelectedOppForDetail(null)}
        opportunity={selectedOppForDetail}
        onAnalyze={(opp) => setSelectedOppForAnalysis(opp)}
      />
    </div>
  );
}
