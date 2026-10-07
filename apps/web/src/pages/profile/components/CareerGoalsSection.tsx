import { CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Target, X } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useState } from 'react';

const LOOKING_FOR_OPTIONS = ['Job', 'Internship', 'Hackathon', 'Competition', 'Fellowship'];

// A reusable modern tag input component
const TagInput = ({ label, placeholder, tags = [], onAdd, onRemove }: any) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val) {
        onAdd(val);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '') {
      if (tags.length > 0) {
        onRemove(tags.length - 1);
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
      <div className="flex flex-wrap items-center gap-2 p-2 min-h-[44px] bg-white border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-shadow cursor-text">
        {tags.map((tag: string, i: number) => (
          <Badge key={i} variant="secondary" className="px-2.5 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center transition-colors">
            {tag}
            <button 
              onClick={() => onRemove(i)} 
              className="ml-1.5 p-0.5 text-gray-400 hover:text-gray-800 rounded-full transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input 
          type="text"
          placeholder={tags.length === 0 ? placeholder : 'Add more...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            const val = inputValue.trim();
            if (val) {
              onAdd(val);
              setInputValue('');
            }
          }}
          className="flex-1 min-w-[120px] bg-transparent border-none focus:outline-none focus:ring-0 text-sm p-0 m-0"
        />
      </div>
    </div>
  );
};

export const CareerGoalsSection = ({ data = {}, onChange }: any) => {
  const toggleLookingFor = (option: string) => {
    const arr = data.lookingFor || [];
    if (arr.includes(option)) {
      onChange({ ...data, lookingFor: arr.filter((a: string) => a !== option) });
    } else {
      onChange({ ...data, lookingFor: [...arr, option] });
    }
  };

  const handleAddArray = (field: string, val: string) => {
    const arr = data[field] || [];
    if (!arr.includes(val)) {
      onChange({ ...data, [field]: [...arr, val] });
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const arr = [...(data[field] || [])];
    arr.splice(index, 1);
    onChange({ ...data, [field]: arr });
  };

  return (
    <div className="flex flex-col">
      <CardHeader className="border-b border-gray-100 pb-5">
        <CardTitle className="flex items-center text-xl text-gray-900">
          <Target className="mr-2 h-6 w-6 text-primary-600"/> 
          Career Goals
        </CardTitle>
        <CardDescription className="ml-8 text-gray-500">
          Define what you are looking for in your career
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">What opportunities are you looking for?</label>
          <div className="flex flex-wrap gap-2.5">
            {LOOKING_FOR_OPTIONS.map(opt => {
              const isSelected = (data.lookingFor || []).includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleLookingFor(opt)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TagInput 
            label="Target Roles" 
            placeholder="e.g. Frontend Engineer, Product Manager"
            tags={data.targetRoles || []}
            onAdd={(val: string) => handleAddArray('targetRoles', val)}
            onRemove={(idx: number) => removeArrayItem('targetRoles', idx)}
          />
          
          <TagInput 
            label="Interested Technologies" 
            placeholder="e.g. React, Python, AWS"
            tags={data.interestedTechnologies || []}
            onAdd={(val: string) => handleAddArray('interestedTechnologies', val)}
            onRemove={(idx: number) => removeArrayItem('interestedTechnologies', idx)}
          />
          
          <div className="md:col-span-2">
            <TagInput 
              label="Career Interests" 
              placeholder="e.g. Open Source, FinTech, Sustainability"
              tags={data.careerInterests || []}
              onAdd={(val: string) => handleAddArray('careerInterests', val)}
              onRemove={(idx: number) => removeArrayItem('careerInterests', idx)}
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Career Goal Summary</label>
          <textarea 
            value={data.careerGoal || ''}
            onChange={(e) => onChange({ ...data, careerGoal: e.target.value })}
            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-shadow h-28 resize-none text-sm"
            placeholder="Describe your ideal next role, what you want to learn, and where you see yourself in the future..."
          />
        </div>
      </CardContent>
    </div>
  );
};
