import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { FileText, Upload, Trash2, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import api from '../../../lib/api';

export const ResumeSection = ({ isEditing, fetchProfile }: any) => {
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
          if (res.data.data.status === 'CONFIRMED') {
            setUploadStatus('completed');
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
    if (isEditing && fileInputRef.current) {
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

      // Start polling for extraction status
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
          
          if (updatedResume.status === 'EXTRACTED') {
            clearInterval(interval);
            setUploadStatus('completed');
            setResumeData({ ...updatedResume, status: 'PENDING_REVIEW' });
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
      fetchProfile(); // Refresh completion
    } catch (err) {
      alert('Failed to confirm resume data');
    }
  };

  const handleDelete = async () => {
    try {
      // Not fully implemented on backend, but we can clear local for MVP, or just call delete
      // await api.delete('/resume');
      setResumeData(null);
      setUploadStatus('idle');
      setProgress(0);
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5"/> Resume</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {!resumeData && uploadStatus === 'idle' ? (
          <div 
            onClick={handleUploadClick}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isEditing ? 'border-primary-300 bg-primary-50 hover:bg-primary-100 cursor-pointer' : 'border-gray-200 bg-gray-50'}`}
          >
            <Upload className={`mx-auto h-12 w-12 mb-4 ${isEditing ? 'text-primary-400' : 'text-gray-300'}`} />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {isEditing ? 'Drag & Drop or Browse Files' : 'No Resume Uploaded'}
            </h3>
            <p className="text-gray-500 text-sm">Supported formats: PDF, DOCX (Max 5MB)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.doc,.docx"
            />
          </div>
        ) : uploadStatus !== 'completed' && uploadStatus !== 'idle' ? (
          <div className="border border-gray-200 rounded-lg p-8 text-center space-y-4">
            <div className="flex justify-center mb-4">
              {uploadStatus === 'uploading' && <Upload className="h-8 w-8 text-primary-500 animate-bounce" />}
              {uploadStatus === 'processing' && <FileText className="h-8 w-8 text-blue-500 animate-pulse" />}
              {uploadStatus === 'analyzing' && <Search className="h-8 w-8 text-purple-500 animate-spin" />}
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 capitalize">{uploadStatus}...</h3>
            
            <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded bg-primary-50 flex items-center justify-center text-primary-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{resumeData?.fileName || 'resume.pdf'}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded: {resumeData?.uploadDate ? new Date(resumeData.uploadDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleUploadClick}>Replace</Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {resumeData?.status === 'PENDING_REVIEW' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">AI Analysis Ready</h4>
                    <p className="text-sm text-yellow-700 mt-1 mb-3">
                      We detected {resumeData.aiDetected?.skillsCount} skills, {resumeData.aiDetected?.expCount} experience entries, and {resumeData.aiDetected?.eduCount} education entry.
                    </p>
                    <Button size="sm" onClick={handleConfirm}>Review & Confirm Analysis</Button>
                  </div>
                </div>
              </div>
            )}

            {resumeData?.status === 'CONFIRMED' && (
              <div className="flex items-center text-sm text-green-600 font-medium">
                <CheckCircle className="h-4 w-4 mr-1" />
                Resume analysis complete and merged.
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
    </Card>
  );
};
