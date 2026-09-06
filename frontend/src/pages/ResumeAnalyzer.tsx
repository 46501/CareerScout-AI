import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Loader2, RefreshCw, Briefcase, Star, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';
import { useAuthStore } from '../store/authStore';

export default function ResumeAnalyzer() {
  const { user, updateUser } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Job Match State
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [targetJobDescription, setTargetJobDescription] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('');
  const [showMatch, setShowMatch] = useState(false);

  useEffect(() => {
    // Load existing analysis if present
    if (user?.profile?.resume?.analysis) {
      setResult({
        data: {
          extractedData: { skills: user.profile.skills || [] },
          analysis: user.profile.resume.analysis
        }
      });
    }

    // Fetch opportunities for matching dropdown
    const fetchOpp = async () => {
      try {
        const res = await api.get('/opportunities?type=Jobs');
        setOpportunities(res.data);
      } catch (err) {}
    };
    fetchOpp();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('resume', file);
    if (targetJobDescription) {
      formData.append('targetJobDescription', targetJobDescription);
    } else if (selectedOpportunity) {
      const opp = opportunities.find(o => o._id === selectedOpportunity);
      if (opp) formData.append('targetJobDescription', opp.description || opp.title);
    }

    try {
      const res = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(res.data);
      // Update auth store with the new analysis so it persists across navigation
      updateUser({
        profile: {
          ...user?.profile,
          resume: {
            ...user?.profile?.resume,
            analysis: res.data.data.analysis
          }
        }
      });
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const handleReAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      let jobDesc = targetJobDescription;
      if (!jobDesc && selectedOpportunity) {
        const opp = opportunities.find(o => o._id === selectedOpportunity);
        if (opp) jobDesc = opp.description || opp.title;
      }

      const res = await api.post('/resume/analyze-saved', { targetJobDescription: jobDesc });
      setResult(res.data);
      updateUser({
        profile: {
          ...user?.profile,
          resume: {
            ...user?.profile?.resume,
            analysis: res.data.data.analysis
          }
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to re-analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const renderScoreCircle = (score: number) => {
    let color = 'text-green-500';
    if (score < 50) color = 'text-red-500';
    else if (score < 80) color = 'text-yellow-500';

    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-200 dark:text-gray-700"
            strokeWidth="3"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={color}
            strokeDasharray={`${score}, 100`}
            strokeWidth="3"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute text-3xl font-bold text-text-color">{score}</div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-color mb-2">Resume Intelligence</h1>
          <p className="text-gray-500 dark:text-gray-400">AI-powered deep analysis of your resume for ATS readiness and job matching.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Upload & Match Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card-color rounded-2xl border border-border-color p-6 text-center">
            <h3 className="font-semibold text-text-color mb-4 text-left">Upload Resume</h3>
            {!file ? (
              <div className="border-2 border-dashed border-border-color rounded-xl p-8 bg-body-bg flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400 mb-4" />
                <p className="text-xs text-gray-500 mb-4">Drag and drop, or browse (PDF/DOCX)</p>
                <label className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg cursor-pointer transition-colors w-full">
                  Browse Files
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            ) : (
              <div className="border border-border-color rounded-xl p-6 bg-body-bg flex flex-col items-center justify-center relative">
                <button 
                  onClick={() => setFile(null)} 
                  className="absolute top-2 right-2 text-xs text-gray-500 hover:text-red-500"
                >
                  Remove
                </button>
                <FileText className="w-10 h-10 text-primary mb-2" />
                <p className="text-sm font-medium text-text-color mb-1 truncate w-full">{file.name}</p>
                <p className="text-xs text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                
                <button 
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Analyze Resume'}
                </button>
              </div>
            )}
            {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
            
            {result && !file && (
              <button 
                onClick={handleReAnalyze}
                disabled={loading}
                className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-text-color text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><RefreshCw className="w-4 h-4" /> Re-Analyze Saved Resume</>}
              </button>
            )}
          </div>

          <div className="bg-card-color rounded-2xl border border-border-color p-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowMatch(!showMatch)}
            >
              <h3 className="font-semibold text-text-color flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Target Job Match
              </h3>
              {showMatch ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            
            {showMatch && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Select an existing opportunity</label>
                  <select 
                    className="w-full p-2 text-sm bg-body-bg border border-border-color rounded-lg text-text-color focus:ring-1 focus:ring-primary"
                    value={selectedOpportunity}
                    onChange={(e) => {
                      setSelectedOpportunity(e.target.value);
                      setTargetJobDescription('');
                    }}
                  >
                    <option value="">None selected</option>
                    {opportunities.map(opp => (
                      <option key={opp._id} value={opp._id}>{opp.title} at {opp.organization || opp.company}</option>
                    ))}
                  </select>
                </div>
                <div className="text-center text-xs text-gray-400">OR</div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Paste Job Description</label>
                  <textarea 
                    className="w-full p-2 text-sm bg-body-bg border border-border-color rounded-lg text-text-color h-24 focus:ring-1 focus:ring-primary"
                    placeholder="Paste the requirements or JD here..."
                    value={targetJobDescription}
                    onChange={(e) => {
                      setTargetJobDescription(e.target.value);
                      setSelectedOpportunity('');
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 italic">Upload or Re-Analyze to see the match score.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="lg:col-span-2 space-y-6">
          {result?.data?.analysis ? (
            <>
              {/* Score Header */}
              <div className="bg-card-color rounded-2xl border border-border-color p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                {renderScoreCircle(result.data.analysis.overallScore || 0)}
                <div className="flex-1 w-full">
                  <h2 className="text-2xl font-bold text-text-color mb-2">Resume Intelligence Score</h2>
                  <p className="text-gray-500 text-sm mb-6">Your resume is scored based on ATS readability, structure, content impact, and skills.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-body-bg p-3 rounded-lg border border-border-color">
                      <div className="text-xs text-gray-500 mb-1">ATS Readiness</div>
                      <div className="font-semibold text-text-color">{result.data.analysis.breakdown?.ats || 0}/20</div>
                    </div>
                    <div className="bg-body-bg p-3 rounded-lg border border-border-color">
                      <div className="text-xs text-gray-500 mb-1">Impact & Action</div>
                      <div className="font-semibold text-text-color">{result.data.analysis.breakdown?.impact || 0}/20</div>
                    </div>
                    <div className="bg-body-bg p-3 rounded-lg border border-border-color">
                      <div className="text-xs text-gray-500 mb-1">Content Quality</div>
                      <div className="font-semibold text-text-color">{result.data.analysis.breakdown?.content || 0}/20</div>
                    </div>
                    <div className="bg-body-bg p-3 rounded-lg border border-border-color">
                      <div className="text-xs text-gray-500 mb-1">Structure</div>
                      <div className="font-semibold text-text-color">{result.data.analysis.breakdown?.structure || 0}/20</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Match Analysis (if provided) */}
              {result.data.analysis.jobMatch && (
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Job Match: {result.data.analysis.jobMatch.score}%</h3>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">{result.data.analysis.jobMatch.explanation}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-green-600 mb-2">Strengths for this role</h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {result.data.analysis.jobMatch.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2">Missing/Weak for this role</h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {result.data.analysis.jobMatch.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-card-color rounded-2xl border border-border-color p-6">
                  <h3 className="text-lg font-bold text-text-color flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-green-500" /> Core Strengths
                  </h3>
                  <ul className="space-y-3">
                    {result.data.analysis.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-card-color rounded-2xl border border-border-color p-6">
                  <h3 className="text-lg font-bold text-text-color flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" /> Areas to Improve
                  </h3>
                  <ul className="space-y-3">
                    {result.data.analysis.weaknesses?.map((w: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0 mt-1.5" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="bg-card-color rounded-2xl border border-border-color p-6">
                <h3 className="text-lg font-bold text-text-color mb-4">Skills Evidence Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Strong Evidence (Proven in bullets)</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.data.analysis.skillStrength?.strong?.map((s: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-xs font-medium">{s}</span>
                      )) || <span className="text-sm text-gray-400">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Moderate Evidence</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.data.analysis.skillStrength?.moderate?.map((s: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md text-xs font-medium">{s}</span>
                      )) || <span className="text-sm text-gray-400">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Weak Evidence (Just mentioned)</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.data.analysis.skillStrength?.weak?.map((s: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs font-medium">{s}</span>
                      )) || <span className="text-sm text-gray-400">None detected</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Roadmap */}
              <div className="bg-card-color rounded-2xl border border-border-color p-6">
                <h3 className="text-lg font-bold text-text-color mb-4">Career & Resume Roadmap</h3>
                <div className="space-y-4">
                  {result.data.analysis.roadmap?.map((step: string, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                        {i !== result.data.analysis.roadmap?.length - 1 && (
                          <div className="w-0.5 h-full bg-border-color my-1" />
                        )}
                      </div>
                      <div className="pb-6 pt-1">
                        <p className="text-sm text-text-color">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-card-color rounded-2xl border border-border-color p-12 text-center opacity-70">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-2">No Analysis Available</h2>
              <p className="text-sm text-gray-500 max-w-sm">Upload a resume or hit re-analyze to generate your intelligent career dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
