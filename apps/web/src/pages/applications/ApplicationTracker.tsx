import { Card, CardContent } from '../../components/ui/Card';
import { BackButton } from '../../components/ui/BackButton';

export function ApplicationTracker() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <BackButton fallback="/dashboard" label="Back to Dashboard" />
          <h1 className="text-2xl font-bold text-gray-900">Application Tracker</h1>
          <p className="text-gray-500">Track the status of jobs you've applied to.</p>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            Kanban Board coming soon...
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
