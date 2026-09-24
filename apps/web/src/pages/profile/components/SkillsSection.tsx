import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Code, X } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

const SKILL_CATEGORIES = [
  { id: 'programmingLanguages', label: 'Programming Languages' },
  { id: 'webDevelopment', label: 'Web Development' },
  { id: 'aiMachineLearning', label: 'AI / Machine Learning' },
  { id: 'databases', label: 'Databases' },
  { id: 'devopsCloud', label: 'DevOps / Cloud' }
];

export const SkillsSection = ({ data = {}, onChange, isEditing }: any) => {
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleAdd = (categoryId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputs[categoryId]?.trim();
      if (!val) return;
      
      const categoryData = data[categoryId] || [];
      // check if exists
      if (!categoryData.find((s: any) => s.name.toLowerCase() === val.toLowerCase())) {
        onChange({
          ...data,
          [categoryId]: [...categoryData, { name: val }]
        });
      }
      setInputs({ ...inputs, [categoryId]: '' });
    }
  };

  const removeSkill = (categoryId: string, index: number) => {
    const categoryData = [...(data[categoryId] || [])];
    categoryData.splice(index, 1);
    onChange({
      ...data,
      [categoryId]: categoryData
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Code className="mr-2 h-5 w-5"/> Technical Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {SKILL_CATEGORIES.map(cat => {
          const skills = data[cat.id] || [];
          // Skip empty categories in view mode
          if (!isEditing && skills.length === 0) return null;

          return (
            <div key={cat.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <label className="block text-sm font-semibold text-gray-800 mb-2">{cat.label}</label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill: any, i: number) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1 text-sm bg-primary-50 text-primary-700 hover:bg-primary-100 flex items-center">
                    {skill.name}
                    {isEditing && (
                      <button onClick={() => removeSkill(cat.id, i)} className="ml-2 text-primary-400 hover:text-primary-700">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {!isEditing && skills.length === 0 && (
                  <span className="text-gray-400 text-sm italic">None added</span>
                )}
              </div>

              {isEditing && (
                <input 
                  type="text"
                  placeholder={`Add ${cat.label.toLowerCase()} (press Enter)`}
                  value={inputs[cat.id] || ''}
                  onChange={(e) => setInputs({ ...inputs, [cat.id]: e.target.value })}
                  onKeyDown={(e) => handleAdd(cat.id, e)}
                  className="w-full max-w-sm p-2 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                />
              )}
            </div>
          );
        })}
        
        {!isEditing && Object.values(data).every((arr: any) => !arr || arr.length === 0) && (
          <p className="text-gray-500 text-sm text-center py-4">No technical skills added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
