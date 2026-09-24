import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Map, X } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useState } from 'react';

const WORK_PREF_OPTIONS = ['Remote', 'Hybrid', 'On-site'];

export const LocationPrefsSection = ({ data = {}, onChange, isEditing }: any) => {
  const [locInput, setLocInput] = useState('');

  const toggleWorkPref = (option: string) => {
    if (!isEditing) return;
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
    }
  };

  const removeLocation = (index: number) => {
    const arr = [...(data.preferredLocations || [])];
    arr.splice(index, 1);
    onChange({ ...data, preferredLocations: arr });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Map className="mr-2 h-5 w-5"/> Preferred Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Preferred Locations</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(data.preferredLocations || []).map((loc: string, i: number) => (
              <Badge key={i} variant="secondary" className="px-3 py-1 text-sm bg-orange-50 text-orange-700 flex items-center">
                {loc}
                {isEditing && (
                  <button onClick={() => removeLocation(i)} className="ml-2 text-orange-400 hover:text-orange-700">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {!isEditing && (data.preferredLocations || []).length === 0 && <span className="text-gray-400 text-sm italic">None added</span>}
          </div>
          {isEditing && (
            <input 
              type="text"
              placeholder="e.g. Bengaluru, Remote, Worldwide (press Enter)"
              value={locInput}
              onChange={(e) => setLocInput(e.target.value)}
              onKeyDown={handleAddLocation}
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Work Preference</label>
          <div className="flex flex-wrap gap-2">
            {WORK_PREF_OPTIONS.map(opt => {
              const isSelected = (data.workPreference || []).includes(opt);
              return (
                <label key={opt} className={`flex items-center text-sm ${!isEditing && !isSelected ? 'hidden' : ''}`}>
                  <input 
                    type="checkbox"
                    disabled={!isEditing}
                    checked={isSelected}
                    onChange={() => toggleWorkPref(opt)}
                    className="mr-2 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 disabled:opacity-50"
                  />
                  {opt}
                </label>
              );
            })}
            {!isEditing && (data.workPreference || []).length === 0 && <span className="text-gray-400 text-sm italic">None selected</span>}
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-semibold text-gray-800">
            Willing to relocate?
            <span className="ml-4 font-normal">
              {isEditing ? (
                <select 
                  value={data.willingToRelocate ? 'Yes' : 'No'}
                  onChange={(e) => onChange({ ...data, willingToRelocate: e.target.value === 'Yes' })}
                  className="p-1.5 border border-gray-300 rounded-md text-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              ) : (
                <span className="text-gray-600">{data.willingToRelocate ? 'Yes' : 'No'}</span>
              )}
            </span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
};
