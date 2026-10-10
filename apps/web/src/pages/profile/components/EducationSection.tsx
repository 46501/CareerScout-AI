import { useState } from 'react';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { GraduationCap, Plus, Trash2, Edit2, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const EducationSection = ({ data = [], onChange }: any) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  const openAddModal = () => {
    setEditIndex(null);
    setFormData({ college: '', degree: '', branch: '', startYear: new Date().getFullYear() - 4, graduationYear: new Date().getFullYear(), cgpa: '' });
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
    closeModal();
  };

  const removeEducation = (index: number) => {
    if(confirm('Are you sure you want to delete this education entry?')) {
      const newData = [...data];
      newData.splice(index, 1);
      onChange(newData);
    }
  };

  return (
    <div className="flex flex-col">
      <CardHeader className="border-b border-gray-100 pb-5 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center text-xl text-gray-900">
            <GraduationCap className="mr-2 h-6 w-6 text-primary-600"/> 
            Education
          </CardTitle>
          <CardDescription className="ml-8 text-gray-500">
            Add your educational background
          </CardDescription>
        </div>
        <Button onClick={openAddModal} className="bg-primary-600 hover:bg-primary-700">
          <Plus className="h-4 w-4 mr-1.5" /> Add Education
        </Button>
      </CardHeader>
      
      <CardContent className="pt-6">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center mb-3">
              <GraduationCap className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No education added</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-sm">Add your university, college, or school to help recruiters understand your academic background.</p>
            <Button variant="outline" size="sm" onClick={openAddModal}>
               Add Education
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((edu: any, i: number) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 p-5 border border-gray-100 bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{edu.college}</h4>
                  <p className="text-sm text-gray-700 mt-0.5">{edu.degree} in {edu.branch}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2 space-x-2">
                    <span>{edu.startYear} — {edu.graduationYear}</span>
                    {edu.cgpa && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                        <span>CGPA: {edu.cgpa}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex sm:flex-col justify-end sm:justify-start gap-2 pt-2 sm:pt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => openEditModal(i)}
                     className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                   >
                     <Edit2 className="h-4 w-4" />
                   </button>
                   <button 
                     onClick={() => removeEducation(i)}
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
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editIndex !== null ? 'Edit' : 'Add'} Education</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">College / University</label>
                <input 
                  type="text" 
                  value={formData.college || ''}
                  onChange={(e) => setFormData({...formData, college: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Lovely Professional University"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Degree</label>
                  <input 
                    type="text" 
                    value={formData.degree || ''}
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g. B.Tech"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
                  <input 
                    type="text" 
                    value={formData.branch || ''}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Year</label>
                  <input 
                    type="number" 
                    value={formData.startYear || ''}
                    onChange={(e) => setFormData({...formData, startYear: parseInt(e.target.value)})}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Graduation Year</label>
                  <input 
                    type="number" 
                    value={formData.graduationYear || ''}
                    onChange={(e) => setFormData({...formData, graduationYear: parseInt(e.target.value)})}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CGPA / Percentage</label>
                <input 
                  type="text" 
                  value={formData.cgpa || ''}
                  onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. 8.5"
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
