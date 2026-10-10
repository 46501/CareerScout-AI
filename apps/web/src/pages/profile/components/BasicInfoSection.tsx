import { CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { User, Mail, MapPin, Link as LinkIcon, Phone, Camera } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const BasicInfoSection = ({ data = {}, onChange }: any) => {
  const { user } = useAuth();
  
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="flex flex-col">
      <CardHeader className="border-b border-gray-100 pb-5">
        <CardTitle className="flex items-center text-xl text-gray-900">
          <User className="mr-2 h-6 w-6 text-primary-600"/> 
          Basic Information
        </CardTitle>
        <CardDescription className="ml-8 text-gray-500">
          Update your personal details and contact information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 order-2 md:order-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  value={data.fullName || ''}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full pl-10 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="email" 
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="tel" 
                  value={data.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full pl-10 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                  placeholder="9307043831"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  value={data.currentCity || ''}
                  onChange={(e) => handleChange('currentCity', e.target.value)}
                  className="w-full pl-10 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                  placeholder="Pune"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-row items-center gap-4 md:w-64 order-1 md:order-2 justify-center md:justify-end pr-0 md:pr-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                {data.profilePhoto ? (
                  <img src={data.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-gray-300" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-full shadow-sm text-primary-600 hover:bg-gray-50 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            <button className="hidden md:flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-3 hover:border-primary-400 hover:bg-primary-50 transition-colors">
               <div className="flex items-center text-primary-600 text-sm font-medium">
                 <Camera className="h-4 w-4 mr-2" />
                 Change Photo
               </div>
               <span className="text-[10px] text-gray-400 mt-1">JPG, PNG up to 5MB</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-gray-900">Social Profiles</h4>
            <p className="text-sm text-gray-500">Add your social profiles to help recruiters find you</p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-blue-50 text-blue-600 rounded p-1 h-6 w-6">
                <LinkIcon className="h-3.5 w-3.5" />
              </div>
              <input 
                type="url" 
                value={data.linkedinUrl || ''}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                className="w-full pl-12 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                placeholder="https://linkedin.com/in/yourusername"
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gray-100 text-gray-700 rounded p-1 h-6 w-6">
                <LinkIcon className="h-3.5 w-3.5" />
              </div>
              <input 
                type="url" 
                value={data.githubUrl || ''}
                onChange={(e) => handleChange('githubUrl', e.target.value)}
                className="w-full pl-12 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                placeholder="https://github.com/yourusername"
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gray-50 text-gray-500 rounded p-1 h-6 w-6">
                <LinkIcon className="h-3.5 w-3.5" />
              </div>
              <input 
                type="url" 
                value={data.portfolioUrl || ''}
                onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                className="w-full pl-12 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
};
