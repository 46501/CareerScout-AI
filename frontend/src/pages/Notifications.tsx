import { useState, useEffect } from 'react';
import { Loader2, Bell, CheckCircle } from 'lucide-react';
import api from '../api';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/user/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/user/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-color mb-2">Notifications</h1>
        <p className="text-gray-500 dark:text-gray-400">Stay updated with alerts and application statuses.</p>
      </div>

      <div className="bg-card-color rounded-2xl border border-border-color shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            No new notifications.
          </div>
        ) : (
          <ul className="divide-y divide-border-color">
            {notifications.map((n) => (
              <li 
                key={n._id} 
                className={`p-6 flex gap-4 transition-colors ${n.read ? 'bg-body-bg opacity-70' : 'bg-card-color hover:bg-gray-50 dark:hover:bg-gray-900/50'}`}
                onClick={() => !n.read && markAsRead(n._id)}
              >
                <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${n.read ? 'bg-transparent' : 'bg-primary'}`} />
                <div className="flex-1">
                  <h3 className={`text-sm ${n.read ? 'font-medium text-gray-600 dark:text-gray-300' : 'font-bold text-text-color'}`}>
                    {n.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
