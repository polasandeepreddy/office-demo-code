import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: string;
  userId?: string;
  fileId?: string;
  actionType?: 'file_created' | 'file_assigned' | 'validation_completed' | 'data_entry_completed' | 'verification_completed' | 'file_approved' | 'file_rejected';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  markAsRead: (id: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = { 
      ...notification, 
      id,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);

    // Auto remove after duration (default 5 seconds for toast, keep workflow notifications longer)
    const duration = notification.actionType ? 10000 : (notification.duration || 5000);
    setTimeout(() => {
      removeNotification(id);
    }, duration);

    // Create workflow notifications for team members
    if (notification.actionType && notification.fileId) {
      createWorkflowNotifications(notification.actionType, notification.fileId, notification.userId);
    }
  }, []);

  const createWorkflowNotifications = useCallback((actionType: string, fileId: string, triggerUserId?: string) => {
    // This would typically integrate with your user service to get team member IDs
    // For now, we'll create general workflow notifications
    
    const workflowNotifications: Array<Omit<Notification, 'id' | 'timestamp'>> = [];

    switch (actionType) {
      case 'file_created':
        workflowNotifications.push({
          type: 'info',
          title: '📋 New File Assignment',
          message: `You have been assigned to work on file ${fileId}`,
          actionType: 'file_assigned',
          fileId,
          duration: 15000
        });
        break;
      
      case 'validation_completed':
        workflowNotifications.push({
          type: 'success',
          title: '✅ Validation Complete',
          message: `File ${fileId} validation is complete and ready for data entry`,
          actionType: 'validation_completed',
          fileId,
          duration: 15000
        });
        break;
      
      case 'data_entry_completed':
        workflowNotifications.push({
          type: 'success',
          title: '📊 Data Entry Complete',
          message: `File ${fileId} data entry is complete and ready for verification`,
          actionType: 'data_entry_completed',
          fileId,
          duration: 15000
        });
        break;
      
      case 'verification_completed':
        workflowNotifications.push({
          type: 'success',
          title: '🔍 Verification Complete',
          message: `File ${fileId} has been verified and is ready for printing`,
          actionType: 'verification_completed',
          fileId,
          duration: 15000
        });
        break;
    }

    // Add workflow notifications with delay to simulate real-time updates
    workflowNotifications.forEach((notif, index) => {
      setTimeout(() => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const workflowNotification: Notification = {
          ...notif,
          id,
          timestamp: new Date().toISOString()
        };
        setNotifications(prev => [workflowNotification, ...prev]);
      }, (index + 1) * 2000);
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    // This could be used for marking notifications as read in the future
    console.log('Marking notification as read:', id);
  }, []);

  const getNotificationsForUser = useCallback((userId: string) => {
    return notifications.filter(n => !n.userId || n.userId === userId);
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5" />;
      case 'error': return <XCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'info': return <Info className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification, 
      clearAll, 
      markAsRead,
      getNotificationsForUser
    }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.slice(0, 3).map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out animate-in slide-in-from-right ${getColors(notification.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold">{notification.title}</h4>
                <p className="text-sm mt-1">{notification.message}</p>
                <p className="text-xs mt-1 opacity-75">{getTimeAgo(notification.timestamp)}</p>
                {notification.fileId && (
                  <p className="text-xs mt-1 font-medium">File: {notification.fileId}</p>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};