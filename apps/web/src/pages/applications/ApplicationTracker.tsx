import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Card, CardContent } from '../../components/ui/Card';
import { BackButton } from '../../components/ui/BackButton';
import { OpportunityDetailModal } from '../../components/ui/OpportunityDetailModal';
import { 
  Briefcase, Building2, Clock, CheckCircle2, XCircle, ChevronRight, 
  Bookmark, Trash2, ExternalLink, ArrowRight, Compass 
} from 'lucide-react';
import api from '../../lib/api';
import { useNotification } from '../../context/NotificationContext';

const COLUMNS = [
  { id: 'SAVED', title: 'Saved', icon: Bookmark, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/50' },
  { id: 'APPLIED', title: 'Applied', icon: ChevronRight, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'ONLINE_ASSESSMENT', title: 'Assessment', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'INTERVIEW', title: 'Interviewing', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'OFFER', title: 'Offer', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'REJECTED', title: 'Rejected', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' }
];

export function ApplicationTracker() {
  const { notify, confirm } = useNotification();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<any>(null);

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
      const columnTitle = COLUMNS.find(c => c.id === newStatus)?.title || newStatus;
      notify.success({
        title: 'Application Moved',
        message: `Status updated to ${columnTitle}.`
      });
    } catch (error) {
      console.error('Failed to update status', error);
      notify.error({
        title: 'Update Failed',
        message: 'Could not update status. Restoring previous state.'
      });
      // Revert if failed
      const res = await api.get('/applications');
      if (res.data.success) setApplications(res.data.data);
    }
  };

  const handleDeleteApplication = async (appId: string, title?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = await confirm({
      title: 'Remove Application',
      message: `Are you sure you want to remove "${title || 'this opportunity'}" from your tracker?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await api.delete(`/applications/${appId}`);
        setApplications(prev => prev.filter(a => a._id !== appId));
        notify.success('Application removed from tracker');
      } catch (err) {
        console.error('Failed to delete application', err);
        notify.error('Could not remove application');
      }
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 tracking-tight flex items-center gap-3">
            Application Tracker
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-600 dark:text-primary-400">
              {applications.length} Active
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your job search pipeline efficiently across status columns.</p>
        </div>

        {/* Empty state hint */}
        {applications.length === 0 && (
          <div className="p-6 rounded-2xl glass-card border border-primary-500/20 bg-primary-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Your tracker is empty</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Save opportunities or click &quot;Apply&quot; in Discover Opportunities to track them through each hiring stage.
                </p>
              </div>
            </div>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shrink-0"
            >
              Discover Opportunities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
        
        <div className="flex-1 overflow-x-auto pb-4 hide-scrollbar">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 min-w-max h-full">
              {COLUMNS.map((col) => {
                const columnApps = getAppsByStatus(col.id);
                const Icon = col.icon;
                
                return (
                  <div key={col.id} className="w-80 flex flex-col h-[calc(100vh-220px)]">
                    {/* Column Header */}
                    <div className={`flex items-center justify-between p-3.5 rounded-t-xl border border-slate-200 dark:border-slate-800 border-b-0 ${col.bg} backdrop-blur-md`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${col.color}`} />
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{col.title}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-sm">
                        {columnApps.length}
                      </span>
                    </div>

                    {/* Droppable Area */}
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 rounded-b-xl border border-slate-200 dark:border-slate-800 transition-colors overflow-y-auto hide-scrollbar ${
                            snapshot.isDraggingOver 
                              ? 'bg-primary-500/10 border-primary-500/30' 
                              : 'bg-slate-100/70 dark:bg-slate-900/40'
                          }`}
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
                                  <Card 
                                    onClick={() => app.opportunity && setSelectedOppForDetail(app.opportunity)}
                                    className={`glass-card bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800/80 hover:border-primary-500/50 cursor-pointer transition-all shadow-sm ${
                                      snapshot.isDragging ? 'shadow-[0_0_20px_rgba(99,102,241,0.25)] rotate-2 scale-105' : ''
                                    }`}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate flex-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                          {app.opportunity?.title || 'Unknown Role'}
                                        </h4>
                                        <button
                                          onClick={(e) => handleDeleteApplication(app._id, app.opportunity?.title, e)}
                                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                                          title="Remove application"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                      <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs mt-1.5 gap-1.5">
                                        <Building2 className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{app.opportunity?.organization || 'Unknown Company'}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] mt-3">
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3 shrink-0" />
                                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Tracked'}
                                        </div>
                                        {app.opportunity?.applicationUrl && (
                                          <a
                                            href={app.opportunity.applicationUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5"
                                          >
                                            Link <ExternalLink className="h-2.5 w-2.5" />
                                          </a>
                                        )}
                                      </div>
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

      {/* Detail Modal */}
      {selectedOppForDetail && (
        <OpportunityDetailModal
          isOpen={!!selectedOppForDetail}
          opportunity={selectedOppForDetail}
          onClose={() => setSelectedOppForDetail(null)}
        />
      )}
    </div>
  );
}

