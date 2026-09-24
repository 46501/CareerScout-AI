import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import api from '../../lib/api';

import { BasicInfoSection } from './components/BasicInfoSection';
import { EducationSection } from './components/EducationSection';
import { SkillsSection } from './components/SkillsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { CareerGoalsSection } from './components/CareerGoalsSection';
import { LocationPrefsSection } from './components/LocationPrefsSection';
import { ResumeSection } from './components/ResumeSection';

const DEFAULT_PROFILE_DATA = {
  personal: { fullName: '', phone: '', currentCity: '', linkedinUrl: '', githubUrl: '', portfolioUrl: '' },
  education: [],
  skills: { programmingLanguages: [], webDevelopment: [], aiMachineLearning: [], databases: [], devopsCloud: [] },
  experience: [],
  careerGoals: { lookingFor: [], targetRoles: [], interestedTechnologies: [], careerInterests: [], careerGoal: '' },
  locationPreferences: { preferredLocations: [], workPreference: [], willingToRelocate: false }
};

export const Profile = () => {
  const [completion, setCompletion] = useState({ percentage: 0, isComplete: false, missingFields: [] as string[] });
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(DEFAULT_PROFILE_DATA);

  const fetchProfile = async () => {
    try {
      const [compRes, profRes] = await Promise.all([
        api.get('/profile/completion'),
        api.get('/profile')
      ]);
      if (compRes.data?.success) setCompletion(compRes.data.data);
      if (profRes.data?.success && profRes.data.data) {
        // Merge with defaults to prevent missing objects
        setProfileData({ 
          personal: { ...DEFAULT_PROFILE_DATA.personal, ...profRes.data.data.personal },
          education: profRes.data.data.education || [],
          skills: { ...DEFAULT_PROFILE_DATA.skills, ...profRes.data.data.skills },
          experience: profRes.data.data.experience || [],
          careerGoals: { ...DEFAULT_PROFILE_DATA.careerGoals, ...profRes.data.data.careerGoals },
          locationPreferences: { ...DEFAULT_PROFILE_DATA.locationPreferences, ...profRes.data.data.locationPreferences }
        });
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
      const res = await api.put('/profile', profileData);
      
      if (res.data?.success && res.data.data) {
        const updated = res.data.data;
        setProfileData({ 
          personal: { ...DEFAULT_PROFILE_DATA.personal, ...updated.personal },
          education: updated.education || [],
          skills: { ...DEFAULT_PROFILE_DATA.skills, ...updated.skills },
          experience: updated.experience || [],
          careerGoals: { ...DEFAULT_PROFILE_DATA.careerGoals, ...updated.careerGoals },
          locationPreferences: { ...DEFAULT_PROFILE_DATA.locationPreferences, ...updated.locationPreferences }
        });
      }

      alert('Profile updated successfully.');
      setIsEditing(false);
      fetchProfile(); // refresh completion status
    } catch (error) {
      console.error('Save profile error:', error);
      alert('Unable to save profile. Please try again.');
    }
  };

  const handleSectionChange = (section: string) => (data: any) => {
    setProfileData((prev: any) => ({
      ...prev,
      [section]: data
    }));
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 pb-20">
      <BackButton fallback="/dashboard" label="Back to Dashboard" />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="space-x-3">
            <Button variant="outline" onClick={() => { setIsEditing(false); fetchProfile(); }}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </div>
      
      {/* Completion Card */}
      <Card className="border-primary-200">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg text-gray-900">Profile Completion</h3>
            <span className="font-bold text-primary-600 text-lg">{completion.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completion.percentage}%` }}></div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Complete</h4>
              <ul className="space-y-1">
                {['Basic Information', 'Education', 'Technical Skills', 'Experience', 'Career Goals', 'Preferred Location', 'Resume']
                  .filter(f => !completion.missingFields.includes(f))
                  .map(field => (
                    <li key={field} className="text-sm text-green-600 flex items-center">
                      <span className="mr-2">✓</span> {field}
                    </li>
                  ))}
              </ul>
            </div>
            
            {completion.missingFields.length > 0 && (
              <div className="flex-1 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Missing</h4>
                <ul className="space-y-1">
                  {completion.missingFields.map(field => (
                    <li key={field} className="text-sm text-yellow-700 flex items-center">
                      <span className="mr-2">○</span> {field}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="grid gap-6">
        <BasicInfoSection data={profileData.personal} onChange={handleSectionChange('personal')} isEditing={isEditing} />
        <EducationSection data={profileData.education} onChange={handleSectionChange('education')} isEditing={isEditing} />
        <SkillsSection data={profileData.skills} onChange={handleSectionChange('skills')} isEditing={isEditing} />
        <ExperienceSection data={profileData.experience} onChange={handleSectionChange('experience')} isEditing={isEditing} />
        <CareerGoalsSection data={profileData.careerGoals} onChange={handleSectionChange('careerGoals')} isEditing={isEditing} />
        <LocationPrefsSection data={profileData.locationPreferences} onChange={handleSectionChange('locationPreferences')} isEditing={isEditing} />
        <ResumeSection isEditing={isEditing} fetchProfile={fetchProfile} />
      </div>
      
      {isEditing && (
        <div className="sticky bottom-4 flex justify-end mt-8">
          <Card className="shadow-lg border-primary-200 bg-white">
            <CardContent className="p-4 flex space-x-3">
              <Button variant="outline" onClick={() => { setIsEditing(false); fetchProfile(); }}>Cancel</Button>
              <Button onClick={handleSave} className="shadow-sm">Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
