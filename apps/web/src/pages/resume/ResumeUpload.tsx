import { Card, CardContent } from '../../components/ui/Card';
import { Upload } from 'lucide-react';
import { BackButton } from '../../components/ui/BackButton';

export function ResumeUpload() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <BackButton fallback="/dashboard" label="Back to Dashboard" />
          <h1 className="text-2xl font-bold text-gray-900">My Resume</h1>
          <p className="text-gray-500">Upload and manage your resume to keep your profile up to date.</p>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Upload className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            Upload component coming soon...
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
