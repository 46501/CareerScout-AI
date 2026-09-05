import { useState, useEffect, useRef } from 'react';
import { Loader2, Save, Upload, FileText, CheckCircle, XCircle, X } from 'lucide-react';
import api from '../api';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  
  const [resumeData, setResumeData] = useState<any>(null); // To store existing resume metadata

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    country: '',
    bio: '',
    
    // Academic
    degree: '',
    institution: '',
    graduationYear: '',

    // Career Preferences
    careerGoal: '',
    experienceLevel: '',
    roles: '', // Target Role / preferred Roles
    workMode: 'Remote',
    preferredLocations: '',
    opportunityTypes: '',

    // Skills
    skills: '', // Core Skills
    languages: '',
    tools: '',
    
    // Links
    linkedin: '',
    github: '',
    portfolio: ''
  });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/profile');
        const p = res.data.profile || {};
        const pref = p.preferences || {};
        
        setFormData({
          name: res.data.name || user?.name || '',
          email: res.data.email || user?.email || '',
          phone: p.phone || '',
          location: p.location || '',
          country: p.country || '',
          bio: p.bio || '',
          
          degree: p.education?.[0]?.degree || '',
          institution: p.education?.[0]?.institution || '',
          graduationYear: p.education?.[0]?.graduationYear || '',
          
          careerGoal: p.careerGoal || '',
          experienceLevel: p.experienceLevel || '',
          roles: pref.roles?.join(', ') || '',
          workMode: pref.workMode || 'Remote',
          preferredLocations: pref.locations?.join(', ') || '',
          opportunityTypes: pref.opportunityTypes?.join(', ') || '',
          
          skills: p.skills?.join(', ') || '',
          languages: p.languages?.join(', ') || '',
          tools: p.tools?.join(', ') || '',
          
          linkedin: p.linkedin || '',
          github: p.github || '',
          portfolio: p.portfolio || ''
        });

        if (p.resume) {
          setResumeData(p.resume);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field if any
    if (validationErrors.includes(name)) {
      setValidationErrors(prev => prev.filter(err => err !== name));
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }
    
    // Validate size (e.g. 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    const payload = new FormData();
    payload.append('resume', file);

    setUploadingResume(true);
    setSubmitError('');

    try {
      const res = await api.post('/resume/upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResumeData({ filename: file.name, uploadedAt: new Date().toISOString() });
      setValidationErrors(prev => prev.filter(err => err !== 'resume'));
      
      // If AI extracted data is returned, prefill empty fields
      if (res.data.data?.extractedData) {
        alert('Resume analyzed! Please review the extracted skills and information.');
        
        const extracted = res.data.data.extractedData;
        setFormData(prev => ({
          ...prev,
          skills: prev.skills ? prev.skills : (extracted.skills?.join(', ') || ''),
          languages: prev.languages ? prev.languages : (extracted.languages?.join(', ') || ''),
          tools: prev.tools ? prev.tools : (extracted.tools?.join(', ') || ''),
        }));
      }

    } catch (err: any) {
      console.error(err);
      setSubmitError(err.response?.data?.error || 'Failed to upload resume. Please try again.');
    } finally {
      setUploadingResume(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeResume = () => {
    setResumeData(null);
  };

  // Dynamic percentage calculation for UI purposes
  const calculateDynamicCompletion = () => {
    let completedFields = 0;
    const totalFields = 11;
    
    if (formData.phone.trim()) completedFields++;
    if (formData.location.trim()) completedFields++;
    if (formData.country.trim()) completedFields++;
    if (formData.degree.trim() && formData.institution.trim() && formData.graduationYear.trim()) completedFields++;
    if (formData.careerGoal.trim()) completedFields++;
    if (formData.opportunityTypes.trim()) completedFields++;
    if (formData.workMode.trim()) completedFields++;
    if (formData.preferredLocations.trim()) completedFields++;
    if (formData.experienceLevel.trim()) completedFields++;
    if (formData.skills.trim()) completedFields++;
    if (resumeData) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const calculateMissingFields = () => {
    const missing: string[] = [];
    if (!formData.phone.trim()) missing.push('phone');
    if (!formData.location.trim()) missing.push('location');
    if (!formData.country.trim()) missing.push('country');
    if (!formData.degree.trim() || !formData.institution.trim() || !formData.graduationYear.trim()) missing.push('education');
    if (!formData.careerGoal.trim()) missing.push('careerGoal');
    if (!formData.opportunityTypes.trim()) missing.push('opportunityTypes');
    if (!formData.workMode.trim()) missing.push('workMode');
    if (!formData.preferredLocations.trim()) missing.push('preferredLocations');
    if (!formData.experienceLevel.trim()) missing.push('experienceLevel');
    if (!formData.skills.trim()) missing.push('skills');
    if (!resumeData) missing.push('resume');
    return missing;
  };

  const dynamicPercentage = calculateDynamicCompletion();
  const missingFieldsList = calculateMissingFields();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSubmitError('');
    setValidationErrors([]);

    const missing = calculateMissingFields();

    if (missing.length > 0) {
      setValidationErrors(missing);
      setSaving(false);
      
      // Scroll to first error
      const firstErrorElement = document.querySelector(`[data-error-field="` + missing[0] + `"]`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        profile: {
          phone: formData.phone,
          location: formData.location,
          country: formData.country,
          bio: formData.bio,
          careerGoal: formData.careerGoal,
          experienceLevel: formData.experienceLevel,
          linkedin: formData.linkedin,
          github: formData.github,
          portfolio: formData.portfolio,
          education: [{
            degree: formData.degree,
            institution: formData.institution,
            graduationYear: formData.graduationYear
          }],
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
          tools: formData.tools.split(',').map(s => s.trim()).filter(Boolean),
          preferences: {
            roles: formData.roles.split(',').map(s => s.trim()).filter(Boolean),
            workMode: formData.workMode,
            locations: formData.preferredLocations.split(',').map(s => s.trim()).filter(Boolean),
            opportunityTypes: formData.opportunityTypes.split(',').map(s => s.trim()).filter(Boolean)
          }
        }
      };

      const res = await api.put('/profile', payload);
      
      updateUser({ 
        name: res.data.user.name,
        email: res.data.user.email,
        profileCompleted: res.data.user.profileCompleted, 
        completionPercentage: res.data.user.completionPercentage 
      });
      
      setShowSuccessModal(true);

    } catch (err) {
      console.error(err);
      setSubmitError('Unable to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getInputClass = (fieldName: string) => {
    const base = `w-full px-3 py-2 border rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary`;
    if (validationErrors.includes(fieldName)) {
      return base + ` border-red-500`;
    }
    return base + ` border-border-color`;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const getMissingFieldLabels = () => {
    const labels: Record<string, string> = {
      phone: 'Phone Number',
      location: 'Current Location',
      country: 'Country',
      education: 'Education (Degree, Institution, Year)',
      careerGoal: 'Target Role / Career Goal',
      opportunityTypes: 'Preferred Job Type',
      workMode: 'Preferred Work Mode',
      preferredLocations: 'Preferred Location(s)',
      experienceLevel: 'Experience Level',
      skills: 'Primary Skills',
      resume: 'Resume / CV'
    };
    return missingFieldsList.map(f => labels[f] || f);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full relative">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-color mb-2">Complete Your Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">Fill in your information to get accurate, personalized opportunities.</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-3xl font-bold text-primary">{dynamicPercentage}%</div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Completed</div>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <span className="text-red-500">*</span> Required fields
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-800 dark:text-red-400 font-medium">Please complete all required fields before saving your profile.</h3>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1 mb-2">Missing important items:</p>
              <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-300 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                {getMissingFieldLabels().map((label, idx) => (
                  <li key={idx}>{label}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {submitError && (
        <div className="p-4 mb-6 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
          <XCircle className="w-5 h-5" /> {submitError}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-10 bg-card-color p-8 rounded-2xl border border-border-color shadow-sm">
        
        {/* RESUME / CV UPLOAD */}
        <div className="space-y-4 scroll-mt-24" data-error-field="resume">
          <h2 className="text-xl font-semibold text-text-color border-b border-border-color pb-2 flex items-center gap-2">
            Resume / CV <span className="text-red-500">*</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload your latest resume to get better opportunity matches.</p>
          
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${validationErrors.includes('resume') ? 'border-red-300 bg-red-50/50 dark:bg-red-900/10' : 'border-border-color hover:border-primary/50'}`}>
            {!resumeData ? (
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 bg-body-bg border border-border-color hover:border-primary hover:text-primary text-text-color font-medium rounded-lg transition-colors">
                  {uploadingResume ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    'Upload Resume'
                  )}
                  <input type="file" accept=".pdf,.docx" onChange={handleResumeUpload} className="hidden" disabled={uploadingResume} />
                </label>
                <p className="mt-3 text-xs text-gray-400">Accepted formats: PDF, DOCX (Max 5MB)</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-text-color font-medium mb-1 flex items-center gap-2">
                  Resume uploaded successfully
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FileText className="w-4 h-4" /> {resumeData.filename}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <label className="cursor-pointer text-sm text-primary hover:text-primary-hover font-medium">
                    {uploadingResume ? 'Replacing...' : 'Replace Resume'}
                    <input type="file" accept=".pdf,.docx" onChange={handleResumeUpload} className="hidden" disabled={uploadingResume} />
                  </label>
                  <button type="button" onClick={removeResume} className="text-sm text-red-500 hover:text-red-600 font-medium">
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
          {validationErrors.includes('resume') && (
            <p className="text-red-500 text-xs mt-1">Please upload a resume.</p>
          )}
        </div>

        {/* PERSONAL INFO */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-color border-b border-border-color pb-2">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} readOnly disabled className="w-full px-3 py-2 border border-border-color rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={formData.email} readOnly disabled className="w-full px-3 py-2 border border-border-color rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="scroll-mt-24" data-error-field="phone">
              <label className="block text-sm font-medium text-text-color mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={getInputClass('phone')} />
              {validationErrors.includes('phone') && <p className="text-red-500 text-xs mt-1">Please enter a valid phone number.</p>}
            </div>
            <div className="scroll-mt-24" data-error-field="location">
              <label className="block text-sm font-medium text-text-color mb-1">Current Location (City/State) <span className="text-red-500">*</span></label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className={getInputClass('location')} placeholder="e.g. San Francisco, CA" />
              {validationErrors.includes('location') && <p className="text-red-500 text-xs mt-1">Please enter your location.</p>}
            </div>
            <div className="scroll-mt-24" data-error-field="country">
              <label className="block text-sm font-medium text-text-color mb-1">Country <span className="text-red-500">*</span></label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} className={getInputClass('country')} placeholder="e.g. United States" />
              {validationErrors.includes('country') && <p className="text-red-500 text-xs mt-1">Please enter your country.</p>}
            </div>
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-text-color mb-1">Bio (Optional)</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className={getInputClass('bio')} placeholder="A short introduction about yourself" />
          </div>
        </div>

        {/* ACADEMIC INFO */}
        <div className="space-y-4 scroll-mt-24" data-error-field="education">
          <h2 className="text-xl font-semibold text-text-color border-b border-border-color pb-2">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Degree <span className="text-red-500">*</span></label>
              <input type="text" name="degree" value={formData.degree} onChange={handleChange} className={getInputClass('education')} placeholder="e.g. B.S. Computer Science" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Institution <span className="text-red-500">*</span></label>
              <input type="text" name="institution" value={formData.institution} onChange={handleChange} className={getInputClass('education')} placeholder="e.g. Stanford University" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Graduation Year <span className="text-red-500">*</span></label>
              <input type="text" name="graduationYear" value={formData.graduationYear} onChange={handleChange} className={getInputClass('education')} placeholder="e.g. 2024" />
            </div>
          </div>
          {validationErrors.includes('education') && (
            <p className="text-red-500 text-xs mt-1">Please complete all required education fields.</p>
          )}
        </div>

        {/* CAREER PREFERENCES */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-color border-b border-border-color pb-2">Career Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="scroll-mt-24" data-error-field="careerGoal">
              <label className="block text-sm font-medium text-text-color mb-1">Target Role / Goal <span className="text-red-500">*</span></label>
              <input type="text" name="careerGoal" value={formData.careerGoal} onChange={handleChange} className={getInputClass('careerGoal')} placeholder="e.g. Full Stack Developer" />
              {validationErrors.includes('careerGoal') && <p className="text-red-500 text-xs mt-1">Target role is required.</p>}
            </div>
            <div className="scroll-mt-24" data-error-field="experienceLevel">
              <label className="block text-sm font-medium text-text-color mb-1">Experience Level <span className="text-red-500">*</span></label>
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className={getInputClass('experienceLevel')}>
                <option value="">Select Level</option>
                <option value="Student">Student</option>
                <option value="Fresher">Fresher / Graduate</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
              {validationErrors.includes('experienceLevel') && <p className="text-red-500 text-xs mt-1">Experience level is required.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="scroll-mt-24" data-error-field="opportunityTypes">
              <label className="block text-sm font-medium text-text-color mb-1">Preferred Job Type <span className="text-red-500">*</span></label>
              <input type="text" name="opportunityTypes" value={formData.opportunityTypes} onChange={handleChange} className={getInputClass('opportunityTypes')} placeholder="e.g. Full-time, Internship" />
              {validationErrors.includes('opportunityTypes') && <p className="text-red-500 text-xs mt-1">Job type is required.</p>}
            </div>
            <div className="scroll-mt-24" data-error-field="workMode">
              <label className="block text-sm font-medium text-text-color mb-1">Preferred Work Mode <span className="text-red-500">*</span></label>
              <select name="workMode" value={formData.workMode} onChange={handleChange} className={getInputClass('workMode')}>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Any">Any</option>
              </select>
              {validationErrors.includes('workMode') && <p className="text-red-500 text-xs mt-1">Work mode is required.</p>}
            </div>
            <div className="scroll-mt-24" data-error-field="preferredLocations">
              <label className="block text-sm font-medium text-text-color mb-1">Preferred Location(s) <span className="text-red-500">*</span></label>
              <input type="text" name="preferredLocations" value={formData.preferredLocations} onChange={handleChange} className={getInputClass('preferredLocations')} placeholder="e.g. New York, London, Remote" />
              {validationErrors.includes('preferredLocations') && <p className="text-red-500 text-xs mt-1">Preferred location is required.</p>}
            </div>
          </div>
        </div>

        {/* SKILLS */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-color border-b border-border-color pb-2">Skills & Tools</h2>
          <div className="scroll-mt-24" data-error-field="skills">
            <label className="block text-sm font-medium text-text-color mb-1">Primary / Technical Skills <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-500 mb-2">Separate with commas (e.g. React, Node.js, Python)</p>
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} className={getInputClass('skills')} />
            {validationErrors.includes('skills') && <p className="text-red-500 text-xs mt-1">At least one primary skill is required.</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Languages (Optional)</label>
              <input type="text" name="languages" value={formData.languages} onChange={handleChange} className={getInputClass('languages')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Tools / Software (Optional)</label>
              <input type="text" name="tools" value={formData.tools} onChange={handleChange} className={getInputClass('tools')} />
            </div>
          </div>
        </div>

        {/* LINKS */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-color border-b border-border-color pb-2">Professional Links (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">LinkedIn</label>
              <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className={getInputClass('linkedin')} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">GitHub</label>
              <input type="url" name="github" value={formData.github} onChange={handleChange} className={getInputClass('github')} placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Portfolio</label>
              <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} className={getInputClass('portfolio')} placeholder="https://yourwebsite.com" />
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="pt-6 flex justify-end items-center border-t border-border-color">
          <div className="mr-6 text-sm text-gray-500 hidden md:block">
            {validationErrors.length > 0 ? (
              <span className="text-red-500 font-medium">Missing {validationErrors.length} required field(s)</span>
            ) : dynamicPercentage === 100 ? (
              <span className="text-green-600 font-medium">Ready to save your complete profile!</span>
            ) : (
              <span>Your profile is {dynamicPercentage}% complete</span>
            )}
          </div>
          <button 
            type="submit" 
            disabled={saving || uploadingResume}
            className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-lg shadow-sm"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>

      </form>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card-color w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative p-8 flex flex-col items-center text-center">
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-text-color mb-2">
                {dynamicPercentage === 100 ? 'Profile Complete!' : 'Profile Saved Successfully'}
              </h3>
              
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                {dynamicPercentage === 100 
                  ? 'Your profile is now complete and ready for personalized career opportunities.'
                  : 'Your CareerScout profile has been updated successfully.'
                }
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => { setShowSuccessModal(false); window.location.href = '/'; }}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
                >
                  Continue Exploring
                </button>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3 bg-body-bg border border-border-color hover:border-gray-400 text-text-color font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
