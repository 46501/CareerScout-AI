import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Briefcase, MapPin, DollarSign, Clock, Star, 
  X, ChevronDown, GraduationCap, Trophy, Award, SlidersHorizontal, 
  RotateCcw, ExternalLink, Sparkles 
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { BackButton } from '../../components/ui/BackButton';
import { MatchAnalyzerModal } from '../../components/ui/MatchAnalyzerModal';
import { OpportunityDetailModal } from '../../components/ui/OpportunityDetailModal';
import { normalizeJobDescription } from '../../lib/descriptionNormalizer';
import api from '../../lib/api';
import { useNotification } from '../../context/NotificationContext';

const CATEGORIES = [
  { id: 'All', label: 'All Opportunities', icon: Briefcase },
  { id: 'Internships', label: 'Internships', icon: GraduationCap },
  { id: 'Jobs', label: 'Jobs', icon: Briefcase },
  { id: 'Hackathons', label: 'Hackathons', icon: Trophy },
  { id: 'Competitions', label: 'Competitions', icon: Award },
  { id: 'Fellowships', label: 'Fellowships', icon: Sparkles }
];

const REMOTE_OPTIONS = [
  { value: 'ALL', label: 'All Locations' },
  { value: 'REMOTE', label: 'Remote Only' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'Onsite' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' }
];

export function OpportunitiesList() {
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL search params
  const initialType = searchParams.get('type') || searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const initialRemote = searchParams.get('remote') || 'ALL';
  const initialLocation = searchParams.get('location') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialType);
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState<string>(initialSearch);
  const [remoteFilter, setRemoteFilter] = useState<string>(initialRemote);
  const [locationFilter, setLocationFilter] = useState<string>(initialLocation);
  const [sortBy, setSortBy] = useState<string>(initialSort);

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedOppForAnalysis, setSelectedOppForAnalysis] = useState<any>(null);
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<any>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync state to URL search parameters without page refresh
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedCategory && selectedCategory !== 'All') params.type = selectedCategory;
    if (appliedSearch) params.search = appliedSearch;
    if (remoteFilter && remoteFilter !== 'ALL') params.remote = remoteFilter;
    if (locationFilter) params.location = locationFilter;
    if (sortBy && sortBy !== 'newest') params.sort = sortBy;

    setSearchParams(params, { replace: true });
  }, [selectedCategory, appliedSearch, remoteFilter, locationFilter, sortBy, setSearchParams]);

  // Fetch opportunities from API when filters change
  useEffect(() => {
    let isCancelled = false;

    const fetchOpps = async () => {
      setLoading(true);
      setPage(1);
      try {
        const queryParams: any = {
          page: 1,
          limit: 15,
          sort: sortBy
        };

        if (selectedCategory && selectedCategory !== 'All') {
          queryParams.type = selectedCategory;
        }
        if (appliedSearch) {
          queryParams.search = appliedSearch;
        }
        if (remoteFilter && remoteFilter !== 'ALL') {
          queryParams.remoteType = remoteFilter;
        }
        if (locationFilter.trim()) {
          queryParams.location = locationFilter.trim();
        }

        const res = await api.get('/opportunities', { params: queryParams });
        if (!isCancelled) {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setOpportunities(res.data.data);
            setTotalCount(res.data.pagination?.total || res.data.data.length);
          } else {
            setOpportunities([]);
            setTotalCount(0);
          }
        }
      } catch (e) {
        if (!isCancelled) {
          console.error('Failed to fetch opportunities:', e);
          setOpportunities([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchOpps();

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, appliedSearch, remoteFilter, locationFilter, sortBy]);

  // Load more pagination handler
  const handleLoadMore = async () => {
    if (loadingMore || opportunities.length >= totalCount) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const queryParams: any = {
        page: nextPage,
        limit: 15,
        sort: sortBy
      };

      if (selectedCategory && selectedCategory !== 'All') {
        queryParams.type = selectedCategory;
      }
      if (appliedSearch) {
        queryParams.search = appliedSearch;
      }
      if (remoteFilter && remoteFilter !== 'ALL') {
        queryParams.remoteType = remoteFilter;
      }
      if (locationFilter.trim()) {
        queryParams.location = locationFilter.trim();
      }

      const res = await api.get('/opportunities', { params: queryParams });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setOpportunities(prev => [...prev, ...res.data.data]);
        setPage(nextPage);
      }
    } catch (e) {
      console.error('Failed to load more opportunities:', e);
      notify.error({ title: 'Error', message: 'Could not load additional opportunities.' });
    } finally {
      setLoadingMore(false);
    }
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchInput('');
    setAppliedSearch('');
    setRemoteFilter('ALL');
    setLocationFilter('');
    setSortBy('newest');
    setIsFilterPanelOpen(false);
  };

  // Count active non-default filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (appliedSearch) count++;
    if (remoteFilter !== 'ALL') count++;
    if (locationFilter.trim()) count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [selectedCategory, appliedSearch, remoteFilter, locationFilter, sortBy]);

  // Helper for type badge styling
  const getTypeBadgeColor = (type: string) => {
    const upper = (type || '').toUpperCase();
    if (upper === 'INTERNSHIP') {
      return 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10';
    }
    if (upper === 'HACKATHON') {
      return 'border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10';
    }
    if (upper === 'COMPETITION') {
      return 'border-purple-500/50 text-purple-600 dark:text-purple-400 bg-purple-500/10';
    }
    if (upper === 'FELLOWSHIP') {
      return 'border-pink-500/50 text-pink-600 dark:text-pink-400 bg-pink-500/10';
    }
    return 'border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-500/10';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-25 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header & Main Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <BackButton fallback="/dashboard" label="Back to Dashboard" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-2 flex items-center gap-3">
              Opportunity Discovery
              {!loading && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-600 dark:text-primary-400">
                  {totalCount} Active
                </span>
              )}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Explore verified jobs, internships, hackathons, and competitions tailored for your career path.
            </p>
          </div>

          <div className="flex w-full md:w-auto items-center space-x-2">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-9 bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-primary-500 h-10 rounded-xl" 
                placeholder="Search title, company, skills..." 
              />
              {searchInput && (
                <button 
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button 
              variant={isFilterPanelOpen || activeFiltersCount > 0 ? 'default' : 'outline'}
              onClick={() => setIsFilterPanelOpen(prev => !prev)}
              className={`border-slate-300 dark:border-slate-700 h-10 px-4 rounded-xl flex items-center gap-2 transition-all ${
                isFilterPanelOpen ? 'bg-primary-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 hide-scrollbar border-b border-slate-200 dark:border-slate-800">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-primary-600 text-white border-primary-500 shadow-md shadow-primary-500/20'
                    : 'bg-white/80 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Collapsible Advanced Filter Panel */}
        {isFilterPanelOpen && (
          <Card className="glass-card border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 bg-white/90 dark:bg-slate-900/90">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Remote / Work Preference */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Work Preference
                </label>
                <div className="relative">
                  <select
                    value={remoteFilter}
                    onChange={(e) => setRemoteFilter(e.target.value)}
                    className="w-full h-10 px-3 pr-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                  >
                    {REMOTE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Location Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Location / Region
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="e.g. Worldwide, USA, Remote..."
                    className="pl-9 h-10 rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs"
                  />
                  {locationFilter && (
                    <button 
                      onClick={() => setLocationFilter('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Sort Order
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-10 px-3 pr-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Reset Actions */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="w-full h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset All Filters
                </Button>
              </div>

            </div>
          </Card>
        )}

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-slate-500">Active filters:</span>
            
            {selectedCategory !== 'All' && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 rounded-lg text-xs bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-500/20">
                Type: {selectedCategory}
                <X className="h-3 w-3 cursor-pointer hover:opacity-75" onClick={() => setSelectedCategory('All')} />
              </Badge>
            )}

            {appliedSearch && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 rounded-lg text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                Query: "{appliedSearch}"
                <X className="h-3 w-3 cursor-pointer hover:opacity-75" onClick={() => { setSearchInput(''); setAppliedSearch(''); }} />
              </Badge>
            )}

            {remoteFilter !== 'ALL' && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 rounded-lg text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                Work: {remoteFilter}
                <X className="h-3 w-3 cursor-pointer hover:opacity-75" onClick={() => setRemoteFilter('ALL')} />
              </Badge>
            )}

            {locationFilter && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 rounded-lg text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                Location: {locationFilter}
                <X className="h-3 w-3 cursor-pointer hover:opacity-75" onClick={() => setLocationFilter('')} />
              </Badge>
            )}

            {sortBy !== 'newest' && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 rounded-lg text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                Sort: {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                <X className="h-3 w-3 cursor-pointer hover:opacity-75" onClick={() => setSortBy('newest')} />
              </Badge>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Opportunity Listings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-16 text-slate-600 dark:text-slate-400 flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Scouting matching opportunities...</p>
              <p className="text-xs text-slate-500 mt-1">Filtering verified listings from connected sources</p>
            </div>
          ) : opportunities.length === 0 ? (
            <Card className="glass-card text-center py-16 px-6 border-slate-200 dark:border-slate-800/50 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto mb-4 border border-primary-500/20">
                {selectedCategory === 'Internships' ? (
                  <GraduationCap className="h-8 w-8" />
                ) : selectedCategory === 'Hackathons' ? (
                  <Trophy className="h-8 w-8" />
                ) : selectedCategory === 'Competitions' ? (
                  <Award className="h-8 w-8" />
                ) : (
                  <Briefcase className="h-8 w-8" />
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No {selectedCategory === 'All' ? 'opportunities' : selectedCategory.toLowerCase()} found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed mb-6">
                {appliedSearch || locationFilter || remoteFilter !== 'ALL'
                  ? 'No results matched your specific search filters. Try broadening your terms or resetting filters.'
                  : `Currently there are no active listings under "${selectedCategory}". Our automated scout continuously scrapes and ingests new verified opportunities.`}
              </p>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="rounded-xl border-primary-500/30 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10"
              >
                Reset All Filters
              </Button>
            </Card>
          ) : (
            <>
              {opportunities.map(opp => (
                <Card 
                  key={opp._id} 
                  className="glass-card hover:border-primary-500/50 transition-all duration-300 cursor-pointer group border-slate-200 dark:border-slate-800/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.18)] hover:-translate-y-0.5 rounded-2xl"
                  onClick={() => setSelectedOppForDetail(opp)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      
                      {/* Organization / Provider Logo */}
                      <div className="w-16 h-16 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                        {opp.organizationLogo ? (
                          <img 
                            src={opp.organizationLogo} 
                            alt={opp.organization} 
                            className="w-12 h-12 object-contain filter brightness-105" 
                            onError={(e) => {
                              // Fallback on broken image link
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : opp.type === 'INTERNSHIP' ? (
                          <GraduationCap className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                        ) : opp.type === 'HACKATHON' ? (
                          <Trophy className="h-8 w-8 text-amber-500 dark:text-amber-400" />
                        ) : (
                          <Briefcase className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                        )}
                      </div>
                      
                      {/* Details Main Body */}
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors tracking-tight">
                              {opp.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-700 dark:text-slate-300 mt-2">
                              <span className="font-semibold text-primary-700 dark:text-primary-200 bg-primary-500/10 px-2 py-0.5 rounded-md border border-primary-500/20 truncate">
                                {opp.organization}
                              </span>
                              <span className="flex items-center truncate text-slate-600 dark:text-slate-400">
                                <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0 text-slate-500" /> 
                                {opp.location || opp.remoteType || 'Remote'}
                              </span>
                              {(opp.salary || opp.stipend) && (
                                <span className="flex items-center truncate text-emerald-600 dark:text-emerald-400 font-medium">
                                  <DollarSign className="h-3.5 w-3.5 mr-0.5 shrink-0" /> 
                                  {opp.salary || opp.stipend}
                                </span>
                              )}
                            </div>
                          </div>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              notify.success({
                                title: 'Saved to Favorites',
                                message: `${opp.title} at ${opp.organization} saved.`
                              });
                            }}
                          >
                            <Star className="h-5 w-5" />
                          </Button>
                        </div>

                        {/* Clean Normalized Excerpt */}
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-sm leading-relaxed">
                          {normalizeJobDescription(opp.description)}
                        </p>
                        
                        {/* AI Match Score Badge (if present) */}
                        {opp.matchDetails && (
                          <div className="bg-primary-900/20 rounded-xl p-3 border border-primary-500/20 backdrop-blur-sm group/match relative overflow-hidden transition-all hover:bg-primary-900/30">
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className="text-primary-700 dark:text-primary-300 font-semibold text-xs flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                                AI Match: {opp.matchDetails.score}%
                              </span>
                              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary-600 to-accent-500 rounded-full" 
                                  style={{ width: `${opp.matchDetails.score}%` }}
                                ></div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-[11px] border-primary-500/30 text-primary-700 dark:text-primary-300 hover:bg-primary-500/20 opacity-0 group-hover/match:opacity-100 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); setSelectedOppForAnalysis(opp); }}
                              >
                                Analyze
                              </Button>
                            </div>
                            {opp.matchDetails.reasons?.length > 0 && (
                              <ul className="text-xs text-primary-700/80 dark:text-primary-200/70 space-y-0.5 ml-4 list-disc marker:text-primary-500/50">
                                {opp.matchDetails.reasons.slice(0, 1).map((r: string, i: number) => (
                                  <li key={i} className="truncate">{r}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        
                        {/* Skills / Themes Tags */}
                        {opp.skills && opp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {opp.skills.slice(0, 6).map((s: string) => (
                              <Badge 
                                key={s} 
                                variant="secondary" 
                                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent text-xs py-0.5 px-2 font-normal"
                              >
                                {s}
                              </Badge>
                            ))}
                            {opp.skills.length > 6 && (
                              <span className="text-[11px] text-slate-500 self-center">
                                +{opp.skills.length - 6} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right-side Action Panel */}
                      <div className="flex md:flex-col justify-between items-center md:items-end w-full md:w-36 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0 mt-2 md:mt-0 gap-4 md:gap-0">
                        <div className="flex flex-col md:items-end w-full">
                          <Badge 
                            variant="outline" 
                            className={`mb-2 md:mb-3 w-fit font-semibold text-xs px-2.5 py-0.5 ${getTypeBadgeColor(opp.type)}`}
                          >
                            {opp.type}
                          </Badge>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-0 md:mb-4 whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(opp.postedAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-auto md:w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary-600 dark:hover:bg-slate-200 font-semibold shadow-md transition-all rounded-xl h-9 text-xs flex items-center justify-center gap-1.5" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            notify.info({
                              title: 'Opening Application',
                              message: `Opening original portal for ${opp.title}...`
                            });
                            window.open(opp.applicationUrl, '_blank', 'noopener,noreferrer'); 
                          }}
                        >
                          <span>Apply Now</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Load More Pagination Button */}
              {opportunities.length < totalCount && (
                <div className="text-center pt-6 pb-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="rounded-xl px-8 h-11 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    {loadingMore ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading opportunities...</span>
                      </div>
                    ) : (
                      <span>Load More Opportunities ({opportunities.length} of {totalCount})</span>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Analyzer Modal */}
      <MatchAnalyzerModal 
        isOpen={!!selectedOppForAnalysis} 
        onClose={() => setSelectedOppForAnalysis(null)} 
        opportunity={selectedOppForAnalysis} 
      />

      {/* Detail Modal */}
      <OpportunityDetailModal
        isOpen={!!selectedOppForDetail}
        onClose={() => setSelectedOppForDetail(null)}
        opportunity={selectedOppForDetail}
        onAnalyze={(opp) => {
          setSelectedOppForAnalysis(opp);
        }}
      />
    </div>
  );
}
