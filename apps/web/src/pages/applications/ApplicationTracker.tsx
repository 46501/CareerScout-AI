import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Card, CardContent } from '../../components/ui/Card';
import { BackButton } from '../../components/ui/BackButton';
import { Briefcase, Building2, Clock, CheckCircle2, XCircle, ChevronRight, Bookmark } from 'lucide-react';
import api from '../../lib/api';

const COLUMNS = [
  { id: 'SAVED', title: 'Saved', icon: Bookmark, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-white/80 dark:bg-slate-900/50' },
  { id: 'APPLIED', title: 'Applied', icon: ChevronRight, color: 'text-blue-400', bg: 'bg-blue-900/20' },
  { id: 'ONLINE_ASSESSMENT', title: 'Assessment', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
  { id: 'INTERVIEW', title: 'Interviewing', icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-900/20' },
  { id: 'OFFER', title: 'Offer', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-900/20' },
  { id: 'REJECTED', title: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/20' }
];

export function ApplicationTracker() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/applications');
        if (res.data.success) setApplications(res.data.data);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    // Optimistic UI update
    setApplications(prev => 
      prev.map(app => app._id === draggableId ? { ...app, status: newStatus } : app)
    );

    try {
      await api.put(`/applications/${draggableId}`, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
      // Revert if failed (simple reload for now)
      const res = await api.get('/applications');
      if (res.data.success) setApplications(res.data.data);
    }
  };

  const getAppsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-400 mt-4">Loading your tracker...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-[1400px] mx-auto space-y-6 relative z-10 flex flex-col h-full">
        <div>
          <BackButton fallback="/dashboard" label="Back to Dashboard" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 tracking-tight">Application Tracker</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your job search pipeline efficiently.</p>
        </div>
        
        <div className="flex-1 overflow-x-auto pb-4 hide-scrollbar">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 min-w-max h-full">
              {COLUMNS.map((col) => {
                const columnApps = getAppsByStatus(col.id);
                const Icon = col.icon;
                
                return (
                  <div key={col.id} className="w-80 flex flex-col h-[calc(100vh-200px)]">
                    {/* Column Header */}
                    <div className={`flex items-center justify-between p-3 rounded-t-xl border border-slate-200 dark:border-slate-800 border-b-0 ${col.bg} backdrop-blur-md`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${col.color}`} />
                        <span className="font-semibold text-slate-200">{col.title}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-900/80 px-2 py-0.5 rounded-full">
                        {columnApps.length}
                      </span>
                    </div>

                    {/* Droppable Area */}
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 rounded-b-xl border border-slate-200 dark:border-slate-800 transition-colors overflow-y-auto hide-scrollbar ${snapshot.isDraggingOver ? 'bg-slate-800/30 border-primary-500/30' : 'bg-slate-900/30'}`}
                        >
                          {columnApps.map((app, index) => (
                            <Draggable key={app._id} draggableId={app._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-3 ${snapshot.isDragging ? 'z-50' : ''}`}
                                >
                                  <Card className={`glass-card border-slate-700/50 hover:border-primary-500/40 transition-all ${snapshot.isDragging ? 'shadow-[0_0_20px_rgba(99,102,241,0.2)] rotate-2 scale-105' : ''}`}>
                                    <CardContent className="p-4">
                                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{app.opportunity?.title || 'Unknown Role'}</h4>
                                      <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs mt-1.5 gap-1.5">
                                        <Building2 className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{app.opportunity?.organization || 'Unknown Company'}</span>
                                      </div>
                                      {app.appliedAt && (
                                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-[10px] mt-3 gap-1">
                                          <Clock className="h-3 w-3 shrink-0" />
                                          {new Date(app.appliedAt).toLocaleDateString()}
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}
