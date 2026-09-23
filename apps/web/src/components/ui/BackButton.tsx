import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  fallback = '/dashboard', 
  label = 'Back',
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If the user arrived here from within the app (i.e. has a key indicating history)
    // we can use navigate(-1). However, React Router doesn't perfectly expose "is this the first page"
    // A common workaround is checking if the history stack has more than one entry, or just using window.history.state
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button 
      onClick={handleBack} 
      className={`flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      {label}
    </button>
  );
};
