import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Target, X } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useState } from 'react';

const LOOKING_FOR_OPTIONS = ['Job', 'Internship', 'Hackathon', 'Competition', 'Fellowship'];

export const CareerGoalsSection = ({ data = {}, onChange, isEditing }: any) => {
  const [roleInput, setRoleInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const toggleLookingFor = (option: string) => {
    if (!isEditing) return;
    const arr = data.lookingFor || [];
    if (arr.includes(option)) {
      onChange({ ...data, lookingFor: arr.filter((a: string) => a !== option) });
    } else {
      onChange({ ...data, lookingFor: [...arr, option] });
    }
  };

  const handleAddArray = (field: string, input: string, setInput: any, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.trim();
      if (!val) return;
      const arr = data[field] || [];
      if (!arr.includes(val)) {
        onChange({ ...data, [field]: [...arr, val] });
      }
      setInput('');
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const arr = [...(data[field] || [])];
    arr.splice(index, 1);
    onChange({ ...data, [field]: arr });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Target className="mr-2 h-5 w-5"/> Career Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">What are you looking for?</label>
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR_OPTIONS.map(opt => {
              const isSelected = (data.lookingFor || []).includes(opt);
              return (
                <Badge 
                  key={opt}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`px-3 py-1 text-sm cursor-pointer transition-colors ${
                    !isEditing ? (isSelected ? '' : 'hidden') : ''
                  }`}
                  onClick={() => toggleLookingFor(opt)}
                >
                  {opt}
                </Badge>
              );
            })}
            {!isEditing && (data.lookingFor || []).length === 0 && <span className="text-gray-400 text-sm italic">None selected</span>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Target Roles</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(data.targetRoles || []).map((role: string, i: number) => (
              <Badge key={i} variant="secondary" className="px-3 py-1 text-sm bg-blue-50 text-blue-700 flex items-center">
                {role}
                {isEditing && (
                  <button onClick={() => removeArrayItem('targetRoles', i)} className="ml-2 text-blue-400 hover:text-blue-700">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {!isEditing && (data.targetRoles || []).length === 0 && <span className="text-gray-400 text-sm italic">None added</span>}
          </div>
          {isEditing && (
            <input 
              type="text"
              placeholder="e.g. Machine Learning Engineer (press Enter)"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => handleAddArray('targetRoles', roleInput, setRoleInput, e)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Interested Technologies</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(data.interestedTechnologies || []).map((tech: string, i: number) => (
              <Badge key={i} variant="secondary" className="px-3 py-1 text-sm bg-purple-50 text-purple-700 flex items-center">
                {tech}
                {isEditing && (
                  <button onClick={() => removeArrayItem('interestedTechnologies', i)} className="ml-2 text-purple-400 hover:text-purple-700">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {!isEditing && (data.interestedTechnologies || []).length === 0 && <span className="text-gray-400 text-sm italic">None added</span>}
          </div>
          {isEditing && (
            <input 
              type="text"
              placeholder="e.g. PyTorch, Next.js (press Enter)"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => handleAddArray('interestedTechnologies', techInput, setTechInput, e)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Career Interests</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(data.careerInterests || []).map((interest: string, i: number) => (
              <Badge key={i} variant="secondary" className="px-3 py-1 text-sm bg-green-50 text-green-700 flex items-center">
                {interest}
                {isEditing && (
                  <button onClick={() => removeArrayItem('careerInterests', i)} className="ml-2 text-green-400 hover:text-green-700">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {!isEditing && (data.careerInterests || []).length === 0 && <span className="text-gray-400 text-sm italic">None added</span>}
          </div>
          {isEditing && (
            <input 
              type="text"
              placeholder="e.g. Data Science, Cybersecurity (press Enter)"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => handleAddArray('careerInterests', interestInput, setInterestInput, e)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Career Goal Summary</label>
          {isEditing ? (
            <textarea 
              value={data.careerGoal || ''}
              onChange={(e) => onChange({ ...data, careerGoal: e.target.value })}
              className="w-full p-2 text-sm border border-gray-300 rounded-md h-24 resize-none"
              placeholder="Describe what type of career opportunities you are looking for..."
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{data.careerGoal || '—'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
