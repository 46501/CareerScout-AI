import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import api from '../api';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    bio: '',
    linkedin: '',
    github: '',
    portfolio: '',
    skills: '', // comma separated for simple editing
    languages: '',
    tools: '',
    preferences: {
      roles: '',
      workMode: 'Remote'
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/profile');
        const p = res.data.profile || {};
        const pref = p.preferences || {};
        
        setFormData({
          phone: p.phone || '',
          location: p.location || '',
          bio: p.bio || '',
          linkedin: p.linkedin || '',
          github: p.github || '',
          portfolio: p.portfolio || '',
          skills: p.skills?.join(', ') || '',
          languages: p.languages?.join(', ') || '',
          tools: p.tools?.join(', ') || '',
          preferences: {
            roles: pref.roles?.join(', ') || '',
            workMode: pref.workMode || 'Remote'
          }
        });
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
    if (name.startsWith('pref_')) {
      const key = name.replace('pref_', '');
      setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        profile: {
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          linkedin: formData.linkedin,
          github: formData.github,
          portfolio: formData.portfolio,
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
          tools: formData.tools.split(',').map(s => s.trim()).filter(Boolean),
          preferences: {
            roles: formData.preferences.roles.split(',').map(s => s.trim()).filter(Boolean),
            workMode: formData.preferences.workMode
          }
        }
      };

      const res = await api.put('/profile', payload);
      setMessage('Profile updated successfully!');
      updateUser({ 
        profileCompleted: res.data.user.profileCompleted, 
        completionPercentage: res.data.user.completionPercentage 
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-color mb-2">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your personal information and preferences.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{user?.completionPercentage || 0}%</div>
          <div className="text-xs text-gray-500 uppercase">Completed</div>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-card-color p-8 rounded-2xl border border-border-color shadow-sm">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-color border-b border-border-color pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-color mb-1">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" />
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-color border-b border-border-color pb-2">Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">LinkedIn</label>
              <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">GitHub</label>
              <input type="url" name="github" value={formData.github} onChange={handleChange} className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Portfolio</label>
              <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
          </div>
        </div>

        {/* Skills & Tools */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-color border-b border-border-color pb-2">Skills & Tools</h2>
          <p className="text-xs text-gray-500 mb-2">Separate items with commas (e.g. React, Node.js, Python)</p>
          <div>
            <label className="block text-sm font-medium text-text-color mb-1">Core Skills</label>
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Languages</label>
              <input type="text" name="languages" value={formData.languages} onChange={handleChange} className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Tools / Software</label>
              <input type="text" name="tools" value={formData.tools} onChange={handleChange} className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-color border-b border-border-color pb-2">Job Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Preferred Roles (comma separated)</label>
              <input type="text" name="pref_roles" value={formData.preferences.roles} onChange={handleChange} className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Work Mode</label>
              <select name="pref_workMode" value={formData.preferences.workMode} onChange={handleChange} className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary">
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Any">Any</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

      </form>
    </div>
  );
}
