import { useState, useRef, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { FileText, Upload, Trash2, CheckCircle, Search, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import api from '../../../lib/api';

export const ResumeSection = ({ fetchProfile }: any) => {
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'analyzing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const res = await api.get('/resume');
        if (res.data?.data) {
          setResumeData(res.data.data);
          if (res.data.data.status === 'CONFIRMED' || res.data.data.status === 'EXTRACTED') {
            setUploadStatus('completed');
          } else if (res.data.data.status === 'PROCESSING') {
             setUploadStatus('processing');
             pollStatus();
          }
        }
      } catch (err) {
        console.error('No resume found');
      } finally {
        setLoading(false);
      }
    };
    loadResume();
  }, []);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    setProgress(10);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
          if (percentCompleted < 100) setProgress(percentCompleted);
        }
      });
      
      setProgress(100);
      setUploadStatus('processing');
      setResumeData(res.data.data);

      pollStatus();
    } catch (error) {
      console.error('Upload failed', error);
      setUploadStatus('idle');
      alert('Upload failed. Please try again.');
    }
  };

  const pollStatus = () => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/resume');
        const updatedResume = res.data?.data;
        if (updatedResume) {
          setResumeData(updatedResume);
          
          if (updatedResume.status === 'EXTRACTED' || updatedResume.status === 'CONFIRMED') {
            clearInterval(interval);
            setUploadStatus('completed');
          } else if (updatedResume.status === 'FAILED') {
            clearInterval(interval);
            setUploadStatus('idle');
            alert('AI Resume extraction failed. Please try again.');
          } else if (updatedResume.status === 'PROCESSING') {
             setUploadStatus('analyzing');
          }
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 2000);
  };

  const handleConfirm = async () => {
    try {
      await api.post('/resume/confirm', { parsedData: resumeData.parsedData });
      setResumeData({ ...resumeData, status: 'CONFIRMED' });
      alert('Resume analysis confirmed and merged into profile');
      fetchProfile();
    } catch (err) {
      alert('Failed to confirm resume data');
    }
  };

  const handleDelete = async () => {
    if(confirm('Are you sure you want to delete your resume?')) {
      try {
        setResumeData(null);
        setUploadStatus('idle');
        setProgress(0);
        fetchProfile();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'CONFIRMED':
      case 'EXTRACTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Processed</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center"><RefreshCw className="h-3 w-3 mr-1 animate-spin"/> Processing...</span>;
      case 'FAILED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col">
      <CardHeader className="border-b border-gray-100 pb-5">
        <CardTitle className="flex items-center text-xl text-gray-900">
          <FileText className="mr-2 h-6 w-6 text-primary-600"/> 
          Resume
        </CardTitle>
        <CardDescription className="ml-8 text-gray-500">
          Upload your resume for AI-powered profile autocomplete
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        
        {!resumeData && uploadStatus === 'idle' ? (
          <div 
            onClick={handleUploadClick}
            className="border-2 border-dashed border-primary-200 bg-primary-50 hover:bg-primary-100 rounded-xl p-12 text-center transition-colors cursor-pointer group"
          >
            <div className="h-16 w-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
               <Upload className="h-8 w-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Upload your resume
            </h3>
            <p className="text-gray-500 text-sm mb-1">Drag & Drop or Browse Files</p>
            <p className="text-gray-400 text-xs">Supported formats: PDF, DOCX (Max 5MB)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.doc,.docx"
            />
          </div>
        ) : uploadStatus !== 'completed' && uploadStatus !== 'idle' ? (
          <div className="border border-gray-100 rounded-xl p-10 text-center space-y-6 shadow-sm bg-white">
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center">
                {uploadStatus === 'uploading' && <Upload className="h-10 w-10 text-primary-500 animate-bounce" />}
                {uploadStatus === 'processing' && <FileText className="h-10 w-10 text-blue-500 animate-pulse" />}
                {uploadStatus === 'analyzing' && <Search className="h-10 w-10 text-purple-500 animate-spin" />}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 capitalize mb-2">{uploadStatus}...</h3>
              <p className="text-sm text-gray-500">Please wait while we process your resume.</p>
            </div>
            
            <div className="w-full max-w-md mx-auto bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <div className="border border-gray-100 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-lg bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{resumeData?.fileName || 'resume.pdf'}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>PDF Document</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                    <span>Uploaded {resumeData?.uploadDate ? new Date(resumeData.uploadDate).toLocaleDateString() : 'recently'}</span>
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(resumeData?.status || 'CONFIRMED')}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-gray-200">
                  <Eye className="h-4 w-4 mr-1.5" /> View
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-gray-200" onClick={handleUploadClick}>
                  <RefreshCw className="h-4 w-4 mr-1.5" /> Replace
                </Button>
                <Button variant="outline" size="sm" className="flex-none border-gray-200 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {resumeData?.status === 'PENDING_REVIEW' && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2.5 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-yellow-900">AI Analysis Ready</h4>
                    <p className="text-sm text-yellow-800 mt-1 mb-3">
                      We detected {resumeData.aiDetected?.skillsCount || 0} skills, {resumeData.aiDetected?.expCount || 0} experience entries, and {resumeData.aiDetected?.eduCount || 0} education entry.
                    </p>
                    <Button size="sm" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300" onClick={handleConfirm}>
                      Review & Confirm Analysis
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.doc,.docx"
            />
          </div>
        )}

      </CardContent>
    </div>
  );
};
