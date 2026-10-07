import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import api from '../../lib/api';
import { User, GraduationCap, Settings, Briefcase, Target, MapPin, FileText, CheckCircle2 } from 'lucide-react';

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
  hasNoExperience: false,
  careerGoals: { lookingFor: [], targetRoles: [], interestedTechnologies: [], careerInterests: [], careerGoal: '' },
  locationPreferences: { preferredLocations: [], workPreference: [], willingToRelocate: false }
};

const SECTIONS = [
  { id: 'basic', label: 'Basic Information', desc: 'Name, contact, social links', icon: User, backendField: 'Basic Information' },
  { id: 'education', label: 'Education', desc: 'Your academic background', icon: GraduationCap, backendField: 'Education' },
  { id: 'skills', label: 'Technical Skills', desc: 'Languages, frameworks, tools', icon: Settings, backendField: 'Technical Skills' },
  { id: 'experience', label: 'Experience', desc: 'Internships, work experience', icon: Briefcase, backendField: 'Experience' },
  { id: 'goals', label: 'Career Goals', desc: 'Roles, interests, preferences', icon: Target, backendField: 'Career Goals' },
  { id: 'location', label: 'Preferred Location', desc: 'Location & work preferences', icon: MapPin, backendField: 'Preferred Location' },
  { id: 'resume', label: 'Resume', desc: 'Upload your resume', icon: FileText, backendField: 'Resume' }
];

export const Profile = () => {
  const [completion, setCompletion] = useState({ percentage: 0, isComplete: false, missingFields: [] as string[] });
  const [profileData, setProfileData] = useState<any>(DEFAULT_PROFILE_DATA);
  const [activeSection, setActiveSection] = useState('basic');

  const fetchProfile = async () => {
    try {
      const profRes = await api.get('/profile');
      if (profRes.data?.success && profRes.data.data) {
        const { profile, profileCompletion } = profRes.data.data;
        if (profileCompletion) setCompletion(profileCompletion);
        
        setProfileData({ 
          personal: { ...DEFAULT_PROFILE_DATA.personal, ...profile?.personal },
          education: profile?.education || [],
          skills: { ...DEFAULT_PROFILE_DATA.skills, ...profile?.skills },
          experience: profile?.experience || [],
          hasNoExperience: profile?.hasNoExperience || false,
          careerGoals: { ...DEFAULT_PROFILE_DATA.careerGoals, ...profile?.careerGoals },
          locationPreferences: { ...DEFAULT_PROFILE_DATA.locationPreferences, ...profile?.locationPreferences }
        });
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Failed to fetch profile', err);
      }
      const compRes = await api.get('/profile/completion').catch(() => null);
      if (compRes?.data?.success) setCompletion(compRes.data.data);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const res = await api.put('/profile', profileData);
      
      if (res.data?.success && res.data.data) {
        const updated = res.data.data.profile;
        if (res.data.data.profileCompletion) {
          setCompletion(res.data.data.profileCompletion);
        }
        
        setProfileData({ 
          personal: { ...DEFAULT_PROFILE_DATA.personal, ...updated?.personal },
          education: updated?.education || [],
          skills: { ...DEFAULT_PROFILE_DATA.skills, ...updated?.skills },
          experience: updated?.experience || [],
          hasNoExperience: updated?.hasNoExperience || false,
          careerGoals: { ...DEFAULT_PROFILE_DATA.careerGoals, ...updated?.careerGoals },
          locationPreferences: { ...DEFAULT_PROFILE_DATA.locationPreferences, ...updated?.locationPreferences }
        });
      }

      alert('Profile updated successfully.');
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-20 bg-gray-50/30 min-h-screen">
      <div>
        <BackButton fallback="/dashboard" label="Back to Dashboard" />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Profile</h1>
          <p className="text-gray-500 mt-1 text-sm">Keep your profile up to date to get better opportunities and personalized recommendations.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50" onClick={fetchProfile}>Cancel</Button>
          <Button className="flex-1 sm:flex-none shadow-sm" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start pt-2">
        
        {/* LEFT PROFILE NAVIGATION */}
        <div className="w-full lg:w-[320px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-3 overflow-x-auto lg:overflow-visible">
          <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              const isCompleted = !completion.missingFields.includes(s.backendField);

              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-start text-left p-4 rounded-lg transition-colors w-full ${
                    isActive ? 'bg-primary-50 text-primary-900' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Icon className={`mt-0.5 mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div className="flex-1 whitespace-nowrap lg:whitespace-normal">
                    <div className={`font-semibold text-sm ${isActive ? 'text-primary-900' : 'text-gray-800'}`}>{s.label}</div>
                    <div className={`text-xs mt-0.5 ${isActive ? 'text-primary-600/80' : 'text-gray-500'}`}>{s.desc}</div>
                  </div>
                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 ml-2 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT MAIN CONTENT AREA */}
        <div className="flex-1 w-full lg:w-auto space-y-6">
          
          {/* Completion Banner */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Profile Completion</h3>
                <p className="text-sm text-gray-500">Complete all sections to get better recommendations</p>
              </div>
            </div>
            
            <div className="w-full md:w-auto bg-green-50 rounded-lg py-2.5 px-4 border border-green-100 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-green-800">{7 - completion.missingFields.length} of 7 sections completed</div>
                <div className="text-xs text-green-700">Keep going! You're almost there.</div>
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 absolute bottom-0 left-0">
               <div className="bg-blue-600 h-1.5 transition-all duration-500" style={{ width: `${completion.percentage}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {activeSection === 'basic' && <BasicInfoSection data={profileData.personal} onChange={handleSectionChange('personal')} isEditing={true} />}
            {activeSection === 'education' && <EducationSection data={profileData.education} onChange={handleSectionChange('education')} isEditing={true} />}
            {activeSection === 'skills' && <SkillsSection data={profileData.skills} onChange={handleSectionChange('skills')} isEditing={true} />}
            {activeSection === 'experience' && <ExperienceSection data={profileData.experience} onChange={handleSectionChange('experience')} isEditing={true} hasNoExperience={profileData.hasNoExperience} onNoExperienceChange={(val: boolean) => setProfileData((prev: any) => ({ ...prev, hasNoExperience: val }))} />}
            {activeSection === 'goals' && <CareerGoalsSection data={profileData.careerGoals} onChange={handleSectionChange('careerGoals')} isEditing={true} />}
            {activeSection === 'location' && <LocationPrefsSection data={profileData.locationPreferences} onChange={handleSectionChange('locationPreferences')} isEditing={true} />}
            {activeSection === 'resume' && <ResumeSection isEditing={true} fetchProfile={fetchProfile} />}
          </div>
          
        </div>
      </div>
    </div>
  );
};
