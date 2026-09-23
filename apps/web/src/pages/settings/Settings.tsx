import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export const Settings = () => {
  const { user } = useAuth();
  const [dailyScout, setDailyScout] = useState(true);
  const [scoutStatus, setScoutStatus] = useState(user?.scoutStatus || 'INCOMPLETE');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.data?.user) {
          setScoutStatus(res.data.data.user.scoutStatus || 'INCOMPLETE');
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadSettings();
  }, []);

  const togglePause = async () => {
    // In a real app we'd call an endpoint to update scoutStatus to PAUSED/ACTIVE
    const newStatus = scoutStatus === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
    setScoutStatus(newStatus);
    alert(`CareerScout is now ${newStatus}`);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <BackButton fallback="/dashboard" label="Back to Dashboard" />
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>CareerScout Automation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-4 border-b">
            <div>
              <h3 className="font-medium text-gray-900">Daily Scout</h3>
              <p className="text-sm text-gray-500">Automatically discover opportunities every 24 hours.</p>
            </div>
            <button 
              onClick={() => setDailyScout(!dailyScout)}
              className={`${dailyScout ? 'bg-primary-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors`}
            >
              <span className={`${dailyScout ? 'translate-x-5' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 mt-1`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <h3 className="font-medium text-gray-900">Scout Status</h3>
              <p className="text-sm text-gray-500">Current status: <span className="font-bold">{scoutStatus}</span></p>
            </div>
            <Button 
              variant={scoutStatus === 'PAUSED' ? 'default' : 'outline'}
              onClick={togglePause}
              disabled={scoutStatus === 'INCOMPLETE'}
            >
              {scoutStatus === 'PAUSED' ? 'Resume Scout' : 'Pause Scout'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
