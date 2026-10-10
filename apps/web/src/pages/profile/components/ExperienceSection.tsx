import { useState } from 'react';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Briefcase, Plus, Trash2, Edit2, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const ExperienceSection = ({ data = [], onChange, hasNoExperience = false, onNoExperienceChange }: any) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  const openAddModal = () => {
    setEditIndex(null);
    setFormData({ company: '', title: '', employmentType: 'Full-time', startDate: '', endDate: '', currentlyWorking: false, location: '', description: '', technologiesUsed: [] });
    setModalOpen(true);
  };

  const openEditModal = (index: number) => {
    setEditIndex(index);
    setFormData({ ...data[index] });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSave = () => {
    if (editIndex !== null) {
      const newData = [...data];
      newData[editIndex] = formData;
      onChange(newData);
    } else {
      onChange([...data, formData]);
    }
    // Also clear the hasNoExperience flag if they add something
    if (hasNoExperience) {
      onNoExperienceChange(false);
    }
    closeModal();
  };

  const removeExperience = (index: number) => {
    if(confirm('Are you sure you want to delete this experience entry?')) {
      const newData = [...data];
      newData.splice(index, 1);
      onChange(newData);
    }
  };

  const handleTechString = (val: string) => {
    setFormData({ ...formData, technologiesUsed: val.split(',').map(s => s.trim()).filter(Boolean) });
  };

  return (
    <div className="flex flex-col">
      <CardHeader className="border-b border-gray-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center text-xl text-gray-900">
            <Briefcase className="mr-2 h-6 w-6 text-primary-600"/> 
            Experience
          </CardTitle>
          <CardDescription className="ml-8 text-gray-500">
            Add your internships and work experience
          </CardDescription>
        </div>
        <Button onClick={openAddModal} disabled={hasNoExperience} className="bg-primary-600 hover:bg-primary-700 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1.5" /> Add Experience
        </Button>
      </CardHeader>
      
      <CardContent className="pt-6">
        {data.length === 0 && !hasNoExperience && (
          <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center mb-3">
              <Briefcase className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No experience added</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-sm">Showcase your professional background, internships, and relevant work.</p>
            <Button variant="outline" size="sm" onClick={openAddModal}>
               Add Experience
            </Button>
            <div className="mt-4 flex items-center justify-center space-x-2">
               <span className="text-gray-300 text-xs">— OR —</span>
            </div>
          </div>
        )}

        {data.length === 0 && (
          <div className={`mt-4 flex items-center justify-center ${hasNoExperience ? 'bg-primary-50 border border-primary-100' : 'bg-gray-50 border border-gray-200'} p-4 rounded-lg transition-colors cursor-pointer`} onClick={() => onNoExperienceChange(!hasNoExperience)}>
            <input 
              type="checkbox" 
              id="noExperience"
              checked={hasNoExperience}
              onChange={(e) => onNoExperienceChange(e.target.checked)}
              className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="noExperience" className="text-sm font-medium text-gray-800 cursor-pointer select-none">
              I have no professional experience yet (Student / Fresher)
            </label>
          </div>
        )}

        {data.length > 0 && (
          <div className="space-y-4">
            {data.map((exp: any, i: number) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 p-5 border border-gray-100 bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{exp.title}</h4>
                      <p className="text-sm font-medium text-gray-700 mt-0.5">{exp.company} <span className="text-gray-400 font-normal">· {exp.employmentType}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mt-2 space-x-2">
                    <span>
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''} 
                      {' — '} 
                      {exp.currentlyWorking ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : '')}
                    </span>
                    {exp.location && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                        <span>{exp.location}</span>
                      </>
                    )}
                  </div>
                  
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                  )}
                  
                  {exp.technologiesUsed && exp.technologiesUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {exp.technologiesUsed.map((tech: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex sm:flex-col justify-end sm:justify-start gap-2 pt-2 sm:pt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => openEditModal(i)}
                     className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                   >
                     <Edit2 className="h-4 w-4" />
                   </button>
                   <button 
                     onClick={() => removeExperience(i)}
                     className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editIndex !== null ? 'Edit' : 'Add'} Experience</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title</label>
                  <input 
                    type="text" 
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g. Software Engineer Intern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                  <input 
                    type="text" 
                    value={formData.company || ''}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g. Google"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Employment Type</label>
                  <select 
                    value={formData.employmentType || 'Full-time'}
                    onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                  <input 
                    type="text" 
                    value={formData.location || ''}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g. Remote, or San Francisco, CA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                  <input 
                    type="month" 
                    value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 7) : ''}
                    onChange={(e) => setFormData({...formData, startDate: new Date(e.target.value).toISOString()})}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                  <div className="space-y-2">
                    <input 
                      type="month" 
                      disabled={formData.currentlyWorking}
                      value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 7) : ''}
                      onChange={(e) => setFormData({...formData, endDate: new Date(e.target.value).toISOString()})}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.currentlyWorking} 
                        onChange={(e) => setFormData({...formData, currentlyWorking: e.target.checked, endDate: e.target.checked ? '' : formData.endDate})}
                        className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      I currently work here
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea 
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-28 resize-none"
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Technologies Used (Comma separated)</label>
                <input 
                  type="text" 
                  value={(formData.technologiesUsed || []).join(', ')}
                  onChange={(e) => handleTechString(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="React, Node.js, AWS"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
