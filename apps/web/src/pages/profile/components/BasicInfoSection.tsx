import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { User, Mail, MapPin, Link as LinkIcon, Phone } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const BasicInfoSection = ({ data = {}, onChange, isEditing }: any) => {
  const { user } = useAuth();
  
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5"/> Basic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
              {data.profilePhoto ? (
                <img src={data.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-gray-300" />
              )}
            </div>
            {isEditing && (
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700">Change Photo</button>
            )}
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                disabled={!isEditing}
                value={data.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={data.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={data.currentCity || ''}
                  onChange={(e) => handleChange('currentCity', e.target.value)}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
            <div className="md:col-span-2 pt-4 border-t mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Social Profiles</h4>
              <div className="space-y-3">
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={data.linkedinUrl || ''}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-900" />
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={data.githubUrl || ''}
                    onChange={(e) => handleChange('githubUrl', e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={data.portfolioUrl || ''}
                    onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
