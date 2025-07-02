import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../Layout';
import { 
  MapPin, 
  Camera, 
  Upload, 
  CheckCircle, 
  Clock,
  FileText,
  Navigation,
  Eye
} from 'lucide-react';
import { fileService, statsService } from '../../services/localStorage';
import { PropertyFile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

export const ValidatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [files, setFiles] = useState<PropertyFile[]>([]);
  const [completedFiles, setCompletedFiles] = useState<PropertyFile[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (user) {
      const assignedFiles = fileService.getByAssignee(user.id, 'validator')
        .filter(f => f.status === 'validation');
      const completed = fileService.getByAssignee(user.id, 'validator')
        .filter(f => f.status !== 'validation');
      
      setFiles(assignedFiles);
      setCompletedFiles(completed);
      setStats(statsService.getUserStats(user.id));
    }
  };

  const getPriorityColor = (createdAt: string) => {
    const daysDiff = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) return 'bg-red-100 text-red-800';
    if (daysDiff > 3) return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityText = (createdAt: string) => {
    const daysDiff = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) return 'High Priority';
    if (daysDiff > 3) return 'Medium Priority';
    return 'Normal Priority';
  };

  return (
    <Layout title="Validator Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Files</p>
                <p className="text-3xl font-bold text-blue-600">{files.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Visits</p>
                <p className="text-3xl font-bold text-amber-600">{files.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-emerald-600">{completedFiles.length}</p>
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
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Assigned Files */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Assigned for Validation</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {files.map((file) => (
              <div key={file.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-900">{file.fileId}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(file.createdAt)}`}>
                      {getPriorityText(file.createdAt)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Created: {new Date(file.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Bank: <span className="font-medium text-gray-900">{file.bankName}</span></p>
                    <p className="text-sm text-gray-600">Property: <span className="font-medium text-gray-900">{file.propertyAddress}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Owner: <span className="font-medium text-gray-900">{file.ownerName}</span></p>
                    <p className="text-sm text-gray-600">Contact: <span className="font-medium text-gray-900">{file.ownerContact}</span></p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/validation/${file.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Start Validation</span>
                </button>
              </div>
            ))}
            
            {files.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No files assigned for validation.</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Files */}
        {completedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recently Completed</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {completedFiles.slice(0, 5).map((file) => (
                <div key={file.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">{file.fileId}</span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Completed
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