import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../Layout';
import { 
  Ruler, 
  Home, 
  DollarSign, 
  FileText, 
  Clock,
  CheckCircle,
  Eye
} from 'lucide-react';
import { fileService, statsService } from '../../services/localStorage';
import { PropertyFile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

export const KeyInDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [readyForEntry, setReadyForEntry] = useState<PropertyFile[]>([]);
  const [completedEntries, setCompletedEntries] = useState<PropertyFile[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (user) {
      const ready = fileService.getByAssignee(user.id, 'keyInOperator')
        .filter(f => f.status === 'data-entry');
      const completed = fileService.getByAssignee(user.id, 'keyInOperator')
        .filter(f => f.status !== 'data-entry' && f.status !== 'validation');
      
      setReadyForEntry(ready);
      setCompletedEntries(completed);
      setStats(statsService.getUserStats(user.id));
    }
  };

  return (
    <Layout title="Key-In Operator Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready for Entry</p>
                <p className="text-3xl font-bold text-blue-600">{readyForEntry.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-amber-600">0</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-emerald-600">{completedEntries.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-purple-600">{stats.thisWeek || 0}</p>
              </div>
              <Home className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Ready for Data Entry */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Ready for Data Entry</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {readyForEntry.map((file) => (
              <div key={file.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-900">{file.fileId}</span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Validated
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Validated: {file.validationData ? new Date(file.validationData.visitDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Bank: <span className="font-medium text-gray-900">{file.bankName}</span></p>
                    <p className="text-sm text-gray-600">Property: <span className="font-medium text-gray-900">{file.propertyAddress}</span></p>
                    <p className="text-sm text-gray-600">Condition: <span className="font-medium text-gray-900">{file.validationData?.propertyCondition || 'N/A'}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Owner: <span className="font-medium text-gray-900">{file.ownerName}</span></p>
                    <p className="text-sm text-gray-600">GPS: <span className="font-medium text-gray-900">
                      {file.validationData ? `${file.validationData.gpsLocation.lat}, ${file.validationData.gpsLocation.lng}` : 'N/A'}
                    </span></p>
                    <p className="text-sm text-gray-600">Notes: <span className="font-medium text-gray-900">{file.validationData?.accessNotes || 'N/A'}</span></p>
                  </div>
                </div>

                {file.validationData && file.validationData.photos.length > 0 && (
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-sm font-medium text-gray-700">Photos:</span>
                    <div className="flex space-x-2">
                      {file.validationData.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Property photo ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/data-entry/${file.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Start Data Entry</span>
                </button>
              </div>
            ))}
            
            {readyForEntry.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No files ready for data entry.</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Entries */}
        {completedEntries.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recently Completed</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {completedEntries.slice(0, 5).map((file) => (
                <div key={file.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">{file.fileId}</span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Data Entered
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{file.bankName} - {file.propertyAddress}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(file.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};