import { CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Map, X } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useState } from 'react';

const WORK_PREF_OPTIONS = ['Remote', 'Hybrid', 'On-site'];

export const LocationPrefsSection = ({ data = {}, onChange }: any) => {
  const [locInput, setLocInput] = useState('');

  const toggleWorkPref = (option: string) => {
    const arr = data.workPreference || [];
    if (arr.includes(option)) {
      onChange({ ...data, workPreference: arr.filter((a: string) => a !== option) });
    } else {
      onChange({ ...data, workPreference: [...arr, option] });
    }
  };

  const handleAddLocation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = locInput.trim();
      if (!val) return;
      const arr = data.preferredLocations || [];
      if (!arr.includes(val)) {
        onChange({ ...data, preferredLocations: [...arr, val] });
      }
      setLocInput('');
    } else if (e.key === 'Backspace' && locInput === '') {
      const arr = data.preferredLocations || [];
      if (arr.length > 0) {
        removeLocation(arr.length - 1);
      }
    }
  };

  const removeLocation = (index: number) => {
    const arr = [...(data.preferredLocations || [])];
    arr.splice(index, 1);
    onChange({ ...data, preferredLocations: arr });
  };

  return (
    <div className="flex flex-col">
      <CardHeader className="border-b border-gray-100 pb-5">
        <CardTitle className="flex items-center text-xl text-gray-900">
          <Map className="mr-2 h-6 w-6 text-primary-600"/> 
          Preferred Location
        </CardTitle>
        <CardDescription className="ml-8 text-gray-500">
          Set your location and work environment preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Preferred Locations</label>
          <div className="flex flex-wrap items-center gap-2 p-2 min-h-[44px] bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-shadow cursor-text">
            {(data.preferredLocations || []).map((loc: string, i: number) => (
              <Badge key={i} variant="secondary" className="px-2.5 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center transition-colors">
                {loc}
                <button 
                  onClick={() => removeLocation(i)} 
                  className="ml-1.5 p-0.5 text-gray-400 hover:text-gray-800 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <input 
              type="text"
              placeholder={(data.preferredLocations || []).length === 0 ? 'e.g. Pune, Bengaluru, Remote' : 'Add more...'}
              value={locInput}
              onChange={(e) => setLocInput(e.target.value)}
              onKeyDown={handleAddLocation}
              onBlur={() => {
                const val = locInput.trim();
                if (val) {
                  const arr = data.preferredLocations || [];
                  if (!arr.includes(val)) {
                    onChange({ ...data, preferredLocations: [...arr, val] });
                  }
                  setLocInput('');
                }
              }}
              className="flex-1 min-w-[150px] bg-transparent border-none focus:outline-none focus:ring-0 text-sm p-0 m-0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Work Preference</label>
          <div className="flex flex-wrap gap-3">
            {WORK_PREF_OPTIONS.map(opt => {
              const isSelected = (data.workPreference || []).includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleWorkPref(opt)}
                  className={`flex-1 sm:flex-none min-w-[120px] px-4 py-3 rounded-xl border text-center transition-all ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm font-medium' 
                      : 'bg-white dark:bg-slate-900 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Willing to relocate?</label>
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => onChange({ ...data, willingToRelocate: false })}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                !data.willingToRelocate ? 'bg-white dark:bg-slate-900 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              No
            </button>
            <button
              onClick={() => onChange({ ...data, willingToRelocate: true })}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                data.willingToRelocate ? 'bg-white dark:bg-slate-900 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Yes
            </button>
          </div>
        </div>
      </CardContent>
    </div>
  );
};
