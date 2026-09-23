import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

import { BackButton } from '../../components/ui/BackButton';

export const Profile = () => {
  const { user } = useAuth();
  const [completion, setCompletion] = useState({ percentage: 0, isComplete: false, missingFields: [] as string[] });
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>({
    personal: { fullName: '', phone: '' },
    education: [],
    skills: { programmingLanguages: [], frameworks: [], databases: [], cloud: [], otherSkills: [] },
    experience: [],
    preferences: { preferredRoles: [], preferredLocations: [], remotePreference: 'ANY', jobPreference: true, internshipPreference: true }
  });

  const fetchProfile = async () => {
    try {
      const [compRes, profRes] = await Promise.all([
        api.get('/profile/completion'),
        api.get('/profile')
      ]);
      if (compRes.data?.success) setCompletion(compRes.data.data);
      if (profRes.data?.success && profRes.data.data) {
        // Merge with defaults to prevent uncontrolled input errors
        setProfileData({ ...profileData, ...profRes.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/profile', profileData);
      alert('Profile updated successfully.');
      setIsEditing(false);
      fetchProfile(); // refresh completion status
    } catch (error) {
      console.error(error);
      alert('Failed to save profile');
    }
  };

  const handleChange = (section: string, field: string, value: any) => {
    setProfileData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section: string, field: string, value: string) => {
    const arrayValues = value.split(',').map(s => s.trim()).filter(Boolean);
    handleChange(section, field, arrayValues);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 pb-20">
      <BackButton fallback="/dashboard" label="Back to Dashboard" />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="space-x-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </div>
      
      {/* Completion Card */}
      <Card className="border-primary-200">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">Profile Completion</h3>
            <span className="font-bold text-primary-600">{completion.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${completion.percentage}%` }}></div>
          </div>
          
          {!completion.isComplete && completion.missingFields.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <h4 className="text-yellow-800 font-medium text-sm mb-1">Missing required fields</h4>
              <ul className="list-disc pl-5 text-sm text-yellow-700">
                {completion.missingFields.map(field => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Form */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={profileData.personal?.fullName || ''}
                  onChange={(e) => handleChange('personal', 'fullName', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={profileData.personal?.phone || ''}
                  onChange={(e) => handleChange('personal', 'phone', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Comma separated values (e.g., JavaScript, Python)</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programming Languages</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={profileData.skills?.programmingLanguages?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('skills', 'programmingLanguages', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frameworks</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={profileData.skills?.frameworks?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('skills', 'frameworks', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Career Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Roles (Comma separated)</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={profileData.preferences?.preferredRoles?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('preferences', 'preferredRoles', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations (Comma separated)</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={profileData.preferences?.preferredLocations?.join(', ') || ''}
                  onChange={(e) => handleArrayChange('preferences', 'preferredLocations', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remote Preference</label>
                <select 
                  disabled={!isEditing}
                  value={profileData.preferences?.remotePreference || 'ANY'}
                  onChange={(e) => handleChange('preferences', 'remotePreference', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">On-site</option>
                  <option value="ANY">Any</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
