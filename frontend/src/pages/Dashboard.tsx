import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import clsx from 'clsx';

const mockOpportunities = [
  {
    id: '1',
    title: 'Full Stack Development Intern',
    organization: 'Women First India Foundation',
    logo: 'https://ui-avatars.com/api/?name=WF&background=random',
    isNew: true,
    isVerified: true,
    workMode: 'Work from home',
    paymentType: 'Unpaid',
    duration: '1 Month',
    description: 'Build and maintain responsive web applications using HTML, CSS, JavaScript; optimize performance and ensure best practices.',
    skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design', 'React', 'Node.js'],
    postedTime: 'Few hours ago',
    matchScore: 94,
    earlyApplicant: true,
  },
  {
    id: '2',
    title: 'AI Data Analytics Intern',
    organization: 'InAmigos Foundation',
    logo: 'https://ui-avatars.com/api/?name=IA&background=random',
    isNew: true,
    isVerified: true,
    workMode: 'Work from home',
    paymentType: 'Unpaid',
    duration: '2 Weeks',
    description: 'Assist with data collection, analysis, and dashboard creation for reports and organizational insights.',
    skills: ['Python', 'Data Analysis', 'Excel', 'SQL', 'Tableau', 'PowerBI'],
    postedTime: 'Few hours ago',
    matchScore: 91,
    earlyApplicant: true,
  },
  {
    id: '3',
    title: 'Application Engineer',
    organization: 'Senso Vision System',
    logo: 'https://ui-avatars.com/api/?name=SV&background=random',
    isNew: false,
    isVerified: false,
    workMode: 'Bangalore',
    paymentType: '₹5,000 - 10,000 /month',
    duration: '3 Months',
    description: 'Evaluate customer requirements, develop turnkey machine vision solutions, and select lighting and imaging components.',
    skills: ['Machine Vision', 'OpenCV', 'Python', 'Troubleshooting', 'C++'],
    postedTime: '1 week ago',
    matchScore: 87,
    earlyApplicant: false,
  },
];

const tabs = ['All', 'Jobs', 'Internships', 'Hackathons', 'Webinars', 'More ⌄'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('All');

  const handleApply = (id: string) => {
    console.log('Apply clicked for:', id);
    // Modal will open or redirect
  };

  const handleCardClick = (id: string) => {
    console.log('Card clicked for:', id);
    // Detail modal will open
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-color mb-2">Good evening, Om! 👋</h1>
        <p className="text-gray-500 dark:text-gray-400">Here are the best opportunities matched for you.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab
                ? 'bg-primary text-white shadow-sm hover:bg-primary-hover'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-500 dark:text-gray-400">42 new opportunities found</span>
        <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-text-color transition-colors">
          Sort by: <span className="font-medium text-text-color">Best Match</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {mockOpportunities.map((opp) => (
          <OpportunityCard
            key={opp.id}
            {...opp}
            onApply={handleApply}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
}
