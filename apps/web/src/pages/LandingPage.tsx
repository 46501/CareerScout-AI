import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Briefcase, Zap, Target, Search } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/50 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">CareerScout AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
            Your AI-Powered <span className="text-primary-600">Career Opportunity</span> Scout
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Stop searching for jobs. Let our advanced AI match your unique profile, skills, and experience with perfect opportunities across the web.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8">
                Start Scouting Now
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-lg px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Zap className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">AI Resume Parsing</h3>
            <p className="text-gray-600">Instantly extract your skills and experience to build a comprehensive career profile.</p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Target className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Precision Matching</h3>
            <p className="text-gray-600">Our hybrid matching engine finds jobs, internships, and hackathons tailored to you.</p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Search className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Automated Scouting</h3>
            <p className="text-gray-600">Background workers constantly scour the web to notify you of new matches instantly.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
