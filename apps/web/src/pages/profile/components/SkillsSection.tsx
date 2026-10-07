import { useState, useRef, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Code, X, Plus } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

const SKILL_CATEGORIES = [
  { id: 'programmingLanguages', label: 'Programming Languages' },
  { id: 'webDevelopment', label: 'Web Development' },
  { id: 'aiMachineLearning', label: 'AI / Machine Learning' },
  { id: 'databases', label: 'Databases' },
  { id: 'devopsCloud', label: 'DevOps / Cloud' }
];

export const SkillsSection = ({ data = {}, onChange }: any) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeCategory && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeCategory]);

  const handleAdd = (categoryId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (!val) {
        setActiveCategory(null);
        return;
      }
      
      const categoryData = data[categoryId] || [];
      if (!categoryData.find((s: any) => s.name.toLowerCase() === val.toLowerCase())) {
        onChange({
          ...data,
          [categoryId]: [...categoryData, { name: val }]
        });
      }
      setInputValue('');
    } else if (e.key === 'Escape') {
      setActiveCategory(null);
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '') {
       // Optional: could remove last chip
    }
  };

  const handleBlur = (categoryId: string) => {
    const val = inputValue.trim();
    if (val) {
      const categoryData = data[categoryId] || [];
      if (!categoryData.find((s: any) => s.name.toLowerCase() === val.toLowerCase())) {
        onChange({
          ...data,
          [categoryId]: [...categoryData, { name: val }]
        });
      }
    }
    setActiveCategory(null);
    setInputValue('');
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
    <div className="flex flex-col">
      <CardHeader className="border-b border-gray-100 pb-5">
        <CardTitle className="flex items-center text-xl text-gray-900">
          <Code className="mr-2 h-6 w-6 text-primary-600"/> 
          Technical Skills
        </CardTitle>
        <CardDescription className="ml-8 text-gray-500">
          Add your technical proficiencies by category
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        {SKILL_CATEGORIES.map(cat => {
          const skills = data[cat.id] || [];
          const isAdding = activeCategory === cat.id;

          return (
            <div key={cat.id} className="relative">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">{cat.label}</h4>
              
              <div className="flex flex-wrap items-center gap-2">
                {skills.map((skill: any, i: number) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm bg-primary-50 text-primary-800 hover:bg-primary-100 flex items-center border border-primary-100 transition-colors">
                    {skill.name}
                    <button 
                      onClick={() => removeSkill(cat.id, i)} 
                      className="ml-2 -mr-1 p-0.5 text-primary-400 hover:text-primary-800 hover:bg-primary-200 rounded-full transition-colors"
                      aria-label="Remove skill"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                
                {isAdding ? (
                  <div className="relative flex items-center">
                    <input 
                      ref={inputRef}
                      type="text"
                      placeholder="Type & press Enter"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => handleAdd(cat.id, e)}
                      onBlur={() => handleBlur(cat.id)}
                      className="px-3 py-1.5 text-sm bg-white border border-primary-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-40 transition-all shadow-sm"
                    />
                  </div>
                ) : (
                  <button 
                    onClick={() => { setActiveCategory(cat.id); setInputValue(''); }}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 rounded-full border-dashed transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </div>
  );
};
