import { useEffect, useState } from 'react';
import { Search, Filter, Briefcase, MapPin, DollarSign, Clock, Star } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { BackButton } from '../../components/ui/BackButton';
import api from '../../lib/api';

export function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <BackButton fallback="/dashboard" label="Back to Dashboard" />
            <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
            <p className="text-gray-500">Discover jobs, internships, and hackathons tailored for you.</p>
          </div>
          <div className="flex w-full md:w-auto space-x-2">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-10" placeholder="Search by role, skill, or company..." />
            </div>
            <Button variant="outline"><Filter className="h-4 w-4 mr-2"/> Filters</Button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">Loading opportunities...</div>
          ) : opportunities.length === 0 ? (
            <Card className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No opportunities found</h3>
              <p className="text-gray-500">Try adjusting your filters or wait for the AI scout to find more.</p>
            </Card>
          ) : (
            opportunities.map(opp => (
              <Card key={opp._id} className="hover:border-primary-200 transition-colors cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      {opp.organizationLogo ? (
                        <img src={opp.organizationLogo} alt={opp.organization} className="w-12 h-12 object-contain" />
                      ) : (
                        <Briefcase className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{opp.title}</h2>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                            <span className="font-medium text-gray-900 truncate">{opp.organization}</span>
                            <span className="flex items-center truncate"><MapPin className="h-3 w-3 mr-1 shrink-0"/> {opp.location || opp.remoteType}</span>
                            {opp.salary && <span className="flex items-center truncate"><DollarSign className="h-3 w-3 mr-1 shrink-0"/> {opp.salary}</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yellow-500">
                          <Star className="h-5 w-5" />
                        </Button>
                      </div>

                      <p className="text-gray-600 line-clamp-2 text-sm">{opp.description}</p>
                      
                      {opp.matchDetails && (
                        <div className="bg-primary-50 rounded-lg p-3 mt-2 border border-primary-100">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-primary-700 font-semibold text-sm">AI Match Score: {opp.matchDetails.score}%</span>
                            <div className="flex-1 h-1.5 bg-primary-200 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-600 rounded-full" style={{ width: `${opp.matchDetails.score}%` }}></div>
                            </div>
                          </div>
                          {opp.matchDetails.reasons?.length > 0 && (
                            <ul className="text-xs text-primary-800 space-y-0.5 ml-4 list-disc">
                              {opp.matchDetails.reasons.slice(0, 2).map((r: string, i: number) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        {opp.skills.map((s: string) => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-between items-center md:items-end w-full md:w-32 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 shrink-0 mt-4 md:mt-0 gap-4 md:gap-0">
                      <div className="flex flex-col md:items-end">
                        <Badge variant="outline" className="mb-2 md:mb-4 w-fit">{opp.type}</Badge>
                        <div className="text-xs text-gray-500 flex items-center mb-0 md:mb-4">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(opp.postedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button className="w-auto md:w-full" onClick={(e) => { e.stopPropagation(); window.open(opp.applicationUrl, '_blank', 'noopener,noreferrer'); }}>Apply</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
