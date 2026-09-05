import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, Briefcase, GraduationCap, Users, BookOpen } from 'lucide-react';

export default function RightPanel() {
  const { user } = useAuthStore();
  const completionPercentage = user?.completionPercentage || 0;

  // Calculate SVG circle properties for the progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <aside className="w-80 flex-shrink-0 bg-[#f8fafc] border-l border-slate-200 h-full overflow-y-auto hidden xl:block p-6">
      
      {/* Your Progress */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
        <h2 className="text-[16px] font-bold text-slate-900 mb-4">Your Progress</h2>
        
        <div className="flex items-center gap-5 mb-6">
          <div className="relative w-[72px] h-[72px]">
            <svg className="w-[72px] h-[72px] transform -rotate-90">
              <circle cx="36" cy="36" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
              <circle 
                cx="36" cy="36" r={radius} 
                stroke="currentColor" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                className="text-blue-600 transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[14px] font-bold text-slate-800">{completionPercentage}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-slate-800 mb-1">Profile Completion</p>
            <p className="text-[11px] text-slate-500 leading-tight">Complete your profile to get better job recommendations.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-600">Basic Information</span>
            <Link to="/profile" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">Edit</Link>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-600">Skills & Interests</span>
            <Link to="/profile" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">Edit</Link>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-600">Resume</span>
            <Link to="/profile" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">Add</Link>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-600">Career Goals</span>
            <Link to="/profile" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">Add</Link>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-600">LinkedIn <span className="text-slate-400 font-normal">(Optional)</span></span>
            <Link to="/profile" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">Add</Link>
          </div>
        </div>
      </div>

      {/* Resume Analysis */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FileText className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-[15px] font-bold text-slate-900 mb-2">Resume Analysis</h2>
          <p className="text-[12px] text-slate-600 mb-5 leading-relaxed">
            Get instant AI feedback on your resume and improve your chances of getting hired.
          </p>
          <Link to="/resume" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all">
            Upload Resume <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-[15px] font-bold text-slate-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/opportunities?type=Jobs" className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-[11px] font-semibold text-slate-600 group-hover:text-blue-700">Find Jobs</span>
          </Link>
          <Link to="/opportunities?type=Internships" className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <GraduationCap className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-[11px] font-semibold text-slate-600 group-hover:text-blue-700">Internships</span>
          </Link>
          <Link to="#" className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-[11px] font-semibold text-slate-600 group-hover:text-blue-700">Learning</span>
          </Link>
          <Link to="#" className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <Users className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-[11px] font-semibold text-slate-600 group-hover:text-blue-700">Community</span>
          </Link>
        </div>
      </div>
      
    </aside>
  );
}
