import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BackButton } from '../../components/ui/BackButton';
import { ClipboardList } from 'lucide-react';
import api from '../../lib/api';

export function ApplicationTracker() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/applications');
        if (res.data.success) setApplications(res.data.data);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <BackButton fallback="/dashboard" label="Back to Dashboard" />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Application Tracker</h1>
          <p className="text-gray-500">Track the status of jobs you've applied to.</p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">Loading applications...</div>
        ) : applications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
              <p className="text-gray-500">You haven't applied to any opportunities yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <Card key={app._id}>
                <CardContent className="p-5 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{app.opportunity?.title || 'Unknown Role'}</h3>
                    <p className="text-sm text-gray-500">{app.opportunity?.organization || 'Unknown Company'}</p>
                    {app.appliedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant={
                    app.status === 'REJECTED' ? 'destructive' :
                    app.status === 'OFFER' ? 'success' :
                    'default'
                  }>
                    {app.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
