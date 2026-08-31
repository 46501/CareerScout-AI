import { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-color mb-2">Resume Analyzer</h1>
          <p className="text-gray-500 dark:text-gray-400">Upload your PDF or DOCX resume to extract data and auto-fill your profile.</p>
        </div>
      </div>

      <div className="bg-card-color rounded-2xl border border-border-color p-8 text-center mb-8">
        <div className="max-w-md mx-auto">
          {!file ? (
            <div className="border-2 border-dashed border-border-color rounded-xl p-12 bg-body-bg flex flex-col items-center justify-center">
              <Upload className="w-10 h-10 text-gray-400 mb-4" />
              <p className="text-sm text-gray-500 mb-4">Drag and drop your resume here, or click to browse</p>
              <label className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                Browse Files
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <div className="border border-border-color rounded-xl p-8 bg-body-bg flex flex-col items-center justify-center relative">
              <button 
                onClick={() => setFile(null)} 
                className="absolute top-4 right-4 text-xs text-gray-500 hover:text-red-500"
              >
                Remove
              </button>
              <FileText className="w-12 h-12 text-primary mb-4" />
              <p className="text-sm font-medium text-text-color mb-2">{file.name}</p>
              <p className="text-xs text-gray-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              
              <button 
                onClick={handleUpload}
                disabled={loading}
                className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : (
                  'Analyze Resume'
                )}
              </button>
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>

      {result && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-green-600 dark:text-green-500">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold text-text-color">Analysis Complete</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card-color p-6 rounded-xl border border-border-color">
              <h3 className="font-semibold text-text-color mb-4">Extracted Information</h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li><strong className="text-text-color">Name:</strong> {result.data.name}</li>
                <li><strong className="text-text-color">Email:</strong> {result.data.email}</li>
                <li><strong className="text-text-color">Phone:</strong> {result.data.phone}</li>
                <li><strong className="text-text-color">Education:</strong> {result.data.education?.length} records found</li>
                <li><strong className="text-text-color">Experience:</strong> {result.data.experience?.length} records found</li>
              </ul>
            </div>

            <div className="bg-card-color p-6 rounded-xl border border-border-color">
              <h3 className="font-semibold text-text-color mb-4">Extracted Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.data.skills?.map((s: string) => (
                  <span key={s} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Your profile has been automatically updated with this information. You can review and edit it in your <a href="/profile" className="font-bold underline hover:text-blue-900">Profile Settings</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
