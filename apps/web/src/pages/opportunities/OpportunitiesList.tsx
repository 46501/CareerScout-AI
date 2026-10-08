import { useEffect, useState } from 'react';
import { Search, Filter, Briefcase, MapPin, DollarSign, Clock, Star } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { BackButton } from '../../components/ui/BackButton';
import { MatchAnalyzerModal } from '../../components/ui/MatchAnalyzerModal';
import api from '../../lib/api';

export function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOppForAnalysis, setSelectedOppForAnalysis] = useState<any>(null);

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const res = await api.get('/opportunities');
        setOpportunities(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <BackButton fallback="/dashboard" label="Back to Dashboard" />
            <h1 className="text-3xl font-bold text-white tracking-tight mt-2">Opportunities</h1>
            <p className="text-slate-400 mt-1">Discover jobs, internships, and hackathons precisely tailored for you.</p>
          </div>
          <div className="flex w-full md:w-auto space-x-2">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 h-10" placeholder="Search by role, skill, or company..." />
            </div>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"><Filter className="h-4 w-4 mr-2"/> Filters</Button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
               <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               Loading opportunities...
            </div>
          ) : opportunities.length === 0 ? (
            <Card className="glass-card text-center py-12 border-slate-800/50">
              <Briefcase className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No opportunities found</h3>
              <p className="text-slate-400">Try adjusting your filters or wait for the AI scout to find more.</p>
            </Card>
          ) : (
            opportunities.map(opp => (
              <Card key={opp._id} className="glass-card hover:border-primary-500/50 transition-all duration-300 cursor-pointer group border-slate-800/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-16 h-16 rounded-xl bg-slate-900/50 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                      {opp.organizationLogo ? (
                        <img src={opp.organizationLogo} alt={opp.organization} className="w-12 h-12 object-contain filter brightness-110" />
                      ) : (
                        <Briefcase className="h-8 w-8 text-slate-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors tracking-tight">{opp.title}</h2>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300 mt-2">
                            <span className="font-semibold text-primary-100 bg-primary-900/30 px-2 py-0.5 rounded border border-primary-500/30 truncate">{opp.organization}</span>
                            <span className="flex items-center truncate text-slate-400"><MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0 text-slate-500"/> {opp.location || opp.remoteType}</span>
                            {opp.salary && <span className="flex items-center truncate text-green-400/90"><DollarSign className="h-3.5 w-3.5 mr-1 shrink-0"/> {opp.salary}</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-yellow-400 hover:bg-yellow-400/10">
                          <Star className="h-5 w-5" />
                        </Button>
                      </div>

                      <p className="text-slate-400 line-clamp-2 text-sm leading-relaxed">{opp.description}</p>
                      
                      {opp.matchDetails && (
                        <div className="bg-primary-900/20 rounded-lg p-3 mt-3 border border-primary-500/20 backdrop-blur-sm group/match relative overflow-hidden transition-all hover:bg-primary-900/30">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-primary-300 font-semibold text-sm">AI Match Score: {opp.matchDetails.score}%</span>
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-gradient-to-r from-primary-600 to-accent-500 rounded-full" style={{ width: `${opp.matchDetails.score}%` }}></div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs border-primary-500/30 text-primary-300 hover:bg-primary-500/20 opacity-0 group-hover/match:opacity-100 transition-opacity absolute right-3"
                              onClick={(e) => { e.stopPropagation(); setSelectedOppForAnalysis(opp); }}
                            >
                              Analyze
                            </Button>
                          </div>
                          {opp.matchDetails.reasons?.length > 0 && (
                            <ul className="text-xs text-primary-200/70 space-y-1 ml-4 list-disc marker:text-primary-500/50 pr-20">
                              {opp.matchDetails.reasons.slice(0, 2).map((r: string, i: number) => (
                                <li key={i} className="truncate">{r}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 pt-3">
                        {opp.skills.map((s: string) => (
                          <Badge key={s} variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-transparent">{s}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-between items-center md:items-end w-full md:w-32 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0 mt-4 md:mt-0 gap-4 md:gap-0">
                      <div className="flex flex-col md:items-end w-full">
                        <Badge variant="outline" className="mb-2 md:mb-4 w-fit border-accent-500/50 text-accent-400 bg-accent-500/10">{opp.type}</Badge>
                        <div className="text-xs text-slate-500 flex items-center mb-0 md:mb-4 whitespace-nowrap">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(opp.postedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button className="w-auto md:w-full bg-white text-slate-900 hover:bg-slate-200 font-semibold shadow-lg transition-all" onClick={(e) => { e.stopPropagation(); window.open(opp.applicationUrl, '_blank', 'noopener,noreferrer'); }}>Apply Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      <MatchAnalyzerModal 
        isOpen={!!selectedOppForAnalysis} 
        onClose={() => setSelectedOppForAnalysis(null)} 
        opportunity={selectedOppForAnalysis} 
      />
    </div>
  );
}
