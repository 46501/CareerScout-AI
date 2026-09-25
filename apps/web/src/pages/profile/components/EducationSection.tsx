import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const EducationSection = ({ data = [], onChange, isEditing }: any) => {
  const addEducation = () => {
    onChange([...data, { college: '', degree: '', branch: '', startYear: new Date().getFullYear() - 4, graduationYear: new Date().getFullYear(), cgpa: '' }]);
  };

  const updateEducation = (index: number, field: string, value: string | number) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const removeEducation = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    onChange(newData);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center"><GraduationCap className="mr-2 h-5 w-5"/> Education</CardTitle>
        {isEditing && (
          <Button variant="outline" size="sm" onClick={addEducation}>
            <Plus className="h-4 w-4 mr-1" /> Add Education
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No education entries added yet.</p>
        ) : (
          <div className="space-y-6 mt-4">
            {data.map((edu: any, i: number) => (
              <div key={i} className="relative p-4 border border-gray-100 bg-gray-50/50 rounded-lg">
                {isEditing && (
                  <button 
                    onClick={() => removeEducation(i)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">College / University</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={edu.college || ''}
                        onChange={(e) => updateEducation(i, 'college', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        placeholder="Lovely Professional University"
                      />
                    ) : (
                      <p className="font-semibold text-gray-900">{edu.college || '—'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Degree</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={edu.degree || ''}
                        onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        placeholder="B.Tech"
                      />
                    ) : (
                      <p className="text-gray-900">{edu.degree || '—'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Branch / Specialization</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={edu.branch || ''}
                        onChange={(e) => updateEducation(i, 'branch', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        placeholder="Computer Science"
                      />
                    ) : (
                      <p className="text-gray-900">{edu.branch || '—'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Start Year</label>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={edu.startYear || ''}
                          onChange={(e) => updateEducation(i, 'startYear', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        />
                      ) : (
                        <p className="text-gray-900">{edu.startYear || '—'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Graduation Year</label>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={edu.graduationYear || ''}
                          onChange={(e) => updateEducation(i, 'graduationYear', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        />
                      ) : (
                        <p className="text-gray-900">{edu.graduationYear || '—'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">CGPA / Percentage</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={edu.cgpa || ''}
                        onChange={(e) => updateEducation(i, 'cgpa', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        placeholder="8.5"
                      />
                    ) : (
                      <p className="text-gray-900">CGPA: {edu.cgpa || '—'}</p>
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
