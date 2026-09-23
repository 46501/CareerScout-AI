import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export const Profile = () => {
  const { user } = useAuth();
  const [completion, setCompletion] = useState({ percentage: 0, isComplete: false, missingFields: [] as string[] });

  useEffect(() => {
    // In a real application, we'd fetch the complete profile here
    // For now we mock the API response for the completion calculation
    const fetchCompletion = async () => {
      try {
        const res = await api.get('/profile/completion');
        if (res.data?.success) {
          setCompletion(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch completion', err);
      }
    };
    fetchCompletion();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <Card className="mb-6 border-primary-200">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">Profile Completion</h3>
            <span className="font-bold text-primary-600">{completion.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${completion.percentage}%` }}></div>
          </div>
          
          {!completion.isComplete && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <h4 className="text-yellow-800 font-medium text-sm mb-1">Missing required fields</h4>
              <ul className="list-disc pl-5 text-sm text-yellow-700">
                {completion.missingFields.map(field => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="mt-3 bg-white">Complete Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mocking the rest of the profile sections for UI structure */}
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Personal Information</CardTitle>
            <Button variant="outline" size="sm">Edit</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3"><span className="text-gray-500">Email</span><span>{user?.email}</span></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Skills</CardTitle>
            <Button variant="outline" size="sm">Edit</Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Add your programming languages, frameworks, and tools.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
