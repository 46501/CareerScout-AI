import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Loader2, 
  X,
  Trash2,
  HelpCircle
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastOptions {
  title?: string;
  message: string;
  duration?: number;
}

export type ToastInput = string | ToastOptions;

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  createdAt: number;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
}

interface ConfirmState extends ConfirmOptions {
  id: string;
  resolve: (value: boolean) => void;
}

export interface NotificationContextType {
  notify: {
    success: (input: ToastInput) => string;
    error: (input: ToastInput) => string;
    warning: (input: ToastInput) => string;
    info: (input: ToastInput) => string;
    loading: (input: ToastInput) => string;
    dismiss: (id: string) => void;
    clearAll: () => void;
  };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  loading: 0, // Loading does not auto-dismiss by default
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activeConfirm, setActiveConfirm] = useState<ConfirmState | null>(null);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const addToast = useCallback((type: ToastType, input: ToastInput): string => {
    const options: ToastOptions = typeof input === 'string' ? { message: input } : input;
    const duration = options.duration !== undefined ? options.duration : DEFAULT_DURATIONS[type];
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    setToasts((prev) => {
      // Prevent duplicate identical toasts currently showing
      const isDuplicate = prev.some(
        (t) => t.type === type && t.message === options.message && (Date.now() - t.createdAt < 1500)
      );
      if (isDuplicate) return prev;

      // Keep maximum 5 active toasts to avoid stacking uncontrollably
      const updated = prev.slice(-4);
      return [
        ...updated,
        {
          id,
          type,
          title: options.title,
          message: options.message,
          duration,
          createdAt: Date.now()
        }
      ];
    });

    if (duration > 0) {
      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [dismissToast]);

  const notify = {
    success: useCallback((input: ToastInput) => addToast('success', input), [addToast]),
    error: useCallback((input: ToastInput) => addToast('error', input), [addToast]),
    warning: useCallback((input: ToastInput) => addToast('warning', input), [addToast]),
    info: useCallback((input: ToastInput) => addToast('info', input), [addToast]),
    loading: useCallback((input: ToastInput) => addToast('loading', input), [addToast]),
    dismiss: dismissToast,
    clearAll: clearAllToasts,
  };

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setActiveConfirm({
        ...options,
        id: `confirm-${Date.now()}`,
        resolve: (value: boolean) => {
          setActiveConfirm(null);
          resolve(value);
        }
      });
    });
  }, []);

  // Cleanup all timers on unmount
  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  // Keyboard accessibility for confirm dialog (Escape closes with false)
  useEffect(() => {
    if (!activeConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        activeConfirm.resolve(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeConfirm]);

  return (
    <NotificationContext.Provider value={{ notify, confirm }}>
      {children}

      {/* Floating Toast Container */}
      <aside 
        aria-label="Notifications" 
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </aside>

      {/* Confirmation Modal */}
      {activeConfirm && (
        <ConfirmDialog 
          options={activeConfirm} 
          onConfirm={() => activeConfirm.resolve(true)} 
          onCancel={() => activeConfirm.resolve(false)} 
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// --- Subcomponents ---

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const iconConfig = {
    success: {
      icon: CheckCircle2,
      iconClass: 'text-emerald-500 dark:text-emerald-400',
      bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20',
      badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    },
    error: {
      icon: AlertCircle,
      iconClass: 'text-rose-500 dark:text-rose-400',
      bgClass: 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20',
      badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
    },
    warning: {
      icon: AlertTriangle,
      iconClass: 'text-amber-500 dark:text-amber-400',
      bgClass: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
    },
    info: {
      icon: Info,
      iconClass: 'text-blue-500 dark:text-blue-400',
      bgClass: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20',
      badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
    },
    loading: {
      icon: Loader2,
      iconClass: 'text-primary-500 dark:text-primary-400 animate-spin',
      bgClass: 'bg-primary-500/10 dark:bg-primary-500/20 border-primary-500/20',
      badgeClass: 'bg-primary-500/10 text-primary-700 dark:text-primary-300'
    }
  };

  const { icon: Icon, iconClass, bgClass } = iconConfig[toast.type];

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className="pointer-events-auto w-full rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-2xl dark:shadow-black/50 p-4 transition-all duration-300 animate-toast-in overflow-hidden relative group"
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className={`p-2 rounded-lg border shrink-0 flex items-center justify-center ${bgClass}`}>
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {toast.title && (
            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {toast.title}
            </h4>
          )}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5 break-words">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          type="button"
          aria-label="Dismiss notification"
          className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Subtle duration bar for timed toasts */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div 
            className={`h-full opacity-60 ${
              toast.type === 'error' ? 'bg-rose-500' :
              toast.type === 'warning' ? 'bg-amber-500' :
              toast.type === 'success' ? 'bg-emerald-500' : 'bg-primary-500'
            }`}
            style={{
              animation: `shrinkWidth ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

interface ConfirmDialogProps {
  options: ConfirmState;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ options, onConfirm, onCancel }) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const isDanger = options.variant === 'danger';
  const isWarning = options.variant === 'warning';

  useEffect(() => {
    // Auto-focus confirm button for quick keyboard navigation
    confirmButtonRef.current?.focus();
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      onClick={onCancel}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 flex items-center justify-center border ${
            isDanger 
              ? 'bg-rose-500/15 border-rose-500/20 text-rose-600 dark:text-rose-400' 
              : isWarning
              ? 'bg-amber-500/15 border-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'bg-primary-500/15 border-primary-500/20 text-primary-600 dark:text-primary-400'
          }`}>
            {isDanger ? (
              <Trash2 className="h-6 w-6" />
            ) : isWarning ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <HelpCircle className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 
              id="confirm-dialog-title" 
              className="text-lg font-bold text-slate-900 dark:text-white tracking-tight"
            >
              {options.title || 'Confirm Action'}
            </h3>
            <p 
              id="confirm-dialog-desc" 
              className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed"
            >
              {options.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {options.cancelText || 'Cancel'}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 shadow-rose-600/25'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-600/25'
                : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 shadow-primary-600/25'
            }`}
          >
            {options.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
