import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const ExperienceSection = ({ data = [], onChange, isEditing }: any) => {
  const addExperience = () => {
    onChange([...data, { company: '', title: '', employmentType: 'Full-time', startDate: '', endDate: '', currentlyWorking: false, location: '', description: '', technologiesUsed: [] }]);
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const removeExperience = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    onChange(newData);
  };

  const handleTechString = (index: number, val: string) => {
    updateExperience(index, 'technologiesUsed', val.split(',').map(s => s.trim()).filter(Boolean));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5"/> Experience</CardTitle>
        {isEditing && (
          <Button variant="outline" size="sm" onClick={addExperience}>
            <Plus className="h-4 w-4 mr-1" /> Add Experience
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No experience entries added yet.</p>
        ) : (
          <div className="space-y-6 mt-4">
            {data.map((exp: any, i: number) => (
              <div key={i} className="relative pl-6 border-l-2 border-primary-200">
                <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-[7px] top-1.5 border-2 border-white shadow-sm"></div>
                
                {isEditing && (
                  <button 
                    onClick={() => removeExperience(i)}
                    className="absolute top-0 right-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Role / Job Title</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={exp.title || ''}
                        onChange={(e) => updateExperience(i, 'title', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white font-semibold"
                        placeholder="Software Engineer Intern"
                      />
                    ) : (
                      <h3 className="text-lg font-bold text-gray-900">{exp.title || '—'}</h3>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={exp.company || ''}
                        onChange={(e) => updateExperience(i, 'company', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        placeholder="Google"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{exp.company || '—'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Employment Type</label>
                    {isEditing ? (
                      <select 
                        value={exp.employmentType || 'Full-time'}
                        onChange={(e) => updateExperience(i, 'employmentType', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                      >
                        <option value="Internship">Internship</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    ) : (
                      <p className="text-gray-600">{exp.employmentType || '—'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                      {isEditing ? (
                        <input 
                          type="date" 
                          value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => updateExperience(i, 'startDate', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
                        />
                      ) : (
                        <p className="text-gray-600 text-sm">
                          {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : '—'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input 
                            type="date" 
                            disabled={exp.currentlyWorking}
                            value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => updateExperience(i, 'endDate', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm disabled:bg-gray-100 disabled:text-gray-400"
                          />
                          <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={exp.currentlyWorking} 
                              onChange={(e) => updateExperience(i, 'currentlyWorking', e.target.checked)}
                              className="mr-2"
                            />
                            Currently working here
                          </label>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">
                          {exp.currentlyWorking ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : '—')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={exp.location || ''}
                        onChange={(e) => updateExperience(i, 'location', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        placeholder="Remote"
                      />
                    ) : (
                      <p className="text-gray-600">{exp.location || '—'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    {isEditing ? (
                      <textarea 
                        value={exp.description || ''}
                        onChange={(e) => updateExperience(i, 'description', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white h-24 resize-none"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">{exp.description || '—'}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Technologies Used (Comma separated)</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={(exp.technologiesUsed || []).join(', ')}
                        onChange={(e) => handleTechString(i, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        placeholder="React, Node.js, AWS"
                      />
                    ) : (
                      <p className="text-gray-600 text-sm font-medium">{(exp.technologiesUsed || []).join(' • ') || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
