import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Bot, LayoutDashboard, User, FileText, Bell, Search, Star, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ saved: 0, applied: 0, interviews: 0 });
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    // Fetch dashboard stats (mocked API call for now, since we haven't built the aggregate endpoint)
    // We'll just fetch a few opportunities to display as top matches
    const fetchDashboardData = async () => {
      try {
        const oppsRes = await api.get('/opportunities?limit=3');
        setMatches(oppsRes.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Layout */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Briefcase className="h-6 w-6 text-primary-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">CareerScout</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-50 text-primary-700">
            <LayoutDashboard className="h-5 w-5 mr-3" /> Dashboard
          </Link>
          <Link to="/opportunities" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900">
            <Search className="h-5 w-5 mr-3 text-gray-400" /> Opportunities
          </Link>
          <Link to="/applications" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900">
            <CheckCircle className="h-5 w-5 mr-3 text-gray-400" /> Applications
          </Link>
          <Link to="/assistant" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900">
            <Bot className="h-5 w-5 mr-3 text-gray-400" /> AI Assistant
          </Link>
          <Link to="/resume" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900">
            <FileText className="h-5 w-5 mr-3 text-gray-400" /> My Resume
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate w-32">{user?.email}</p>
              <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-700">Sign out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Bot className="h-4 w-4 mr-2" /> Run AI Scout
            </Button>
            <button className="text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-5 flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Star className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Saved Jobs</h3>
                  <p className="text-2xl font-semibold text-gray-900">{stats.saved}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Applied</h3>
                  <p className="text-2xl font-semibold text-gray-900">{stats.applied}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Interviews</h3>
                  <p className="text-2xl font-semibold text-gray-900">{stats.interviews}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary-600 text-white border-none">
              <CardContent className="p-5 flex items-center justify-between h-full">
                <div>
                  <h3 className="text-sm font-medium text-primary-100 mb-1">AI Scout Status</h3>
                  <p className="text-lg font-semibold flex items-center"><span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" /> Active</p>
                </div>
                <Bot className="h-10 w-10 text-primary-200 opacity-50" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Matches */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Top Matches for You</h2>
                <Link to="/opportunities" className="text-sm font-medium text-primary-600 hover:text-primary-500">View all</Link>
              </div>
              
              {matches.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Scouting in progress...</h3>
                    <p className="text-sm text-gray-500 mt-1">Our AI is currently analyzing thousands of opportunities to find your perfect match.</p>
                  </CardContent>
                </Card>
              ) : (
                matches.map(match => (
                  <Card key={match._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{match.title}</h3>
                            <p className="text-sm text-gray-500">{match.organization} • {match.location || match.remoteType}</p>
                          </div>
                          <Badge variant="success">98% Match</Badge>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {match.skills?.slice(0, 4).map((s: string) => (
                            <Badge key={s} variant="secondary">{s}</Badge>
                          ))}
                          {match.skills?.length > 4 && (
                            <Badge variant="outline">+{match.skills.length - 4} more</Badge>
                          )}
                        </div>
                      </div>
                      <div className="sm:border-l border-gray-200 sm:pl-4 flex flex-col justify-between items-end">
                        <div className="flex text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" /> 2 days left
                        </div>
                        <Button className="mt-4 sm:mt-0">Apply Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Upcoming Deadlines / Alerts */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Alerts</h2>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Profile Strength</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">75% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    Upload your latest resume to boost your match accuracy.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full">Upload Resume</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
