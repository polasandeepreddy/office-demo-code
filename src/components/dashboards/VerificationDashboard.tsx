import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../Layout';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  FileText, 
  Clock,
  AlertTriangle,
  Eye,
  Printer
} from 'lucide-react';
import { fileService, statsService } from '../../services/localStorage';
import { PropertyFile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

export const VerificationDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [pendingVerification, setPendingVerification] = useState<PropertyFile[]>([]);
  const [readyToPrint, setReadyToPrint] = useState<PropertyFile[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const pending = fileService.getByStatus('verification');
    const ready = fileService.getByStatus('ready-to-print');
    
    setPendingVerification(pending);
    setReadyToPrint(ready);
    setStats(statsService.getOverallStats());
  };

  const handlePrint = (fileId: string) => {
    fileService.markCompleted(fileId);
    addNotification({
      type: 'success',
      title: 'File Completed',
      message: 'File has been marked as printed and completed!'
    });
    loadData();
  };

  return (
    <Layout title="Verification Department">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-amber-600">{pendingVerification.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Print</p>
                <p className="text-3xl font-bold text-emerald-600">{readyToPrint.length}</p>
              </div>
              <Printer className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completedFiles || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalFiles || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pending Verification</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingVerification.map((file) => (
              <div key={file.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-900">{file.fileId}</span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                      Needs Review
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Data Entry: {file.propertyData ? new Date(file.propertyData.entryDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Bank: <span className="font-medium text-gray-900">{file.bankName}</span></p>
                    <p className="text-sm text-gray-600">Property: <span className="font-medium text-gray-900">{file.propertyAddress}</span></p>
                    <p className="text-sm text-gray-600">Owner: <span className="font-medium text-gray-900">{file.ownerName}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Area: <span className="font-medium text-gray-900">{file.propertyData?.measurements.area || 'N/A'} sq ft</span></p>
                    <p className="text-sm text-gray-600">Type: <span className="font-medium text-gray-900">{file.propertyData?.constructionDetails.type || 'N/A'}</span></p>
                    <p className="text-sm text-gray-600">Year: <span className="font-medium text-gray-900">{file.propertyData?.constructionDetails.yearBuilt || 'N/A'}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Value: <span className="font-medium text-gray-900">
                      ${file.propertyData?.valuation.estimatedValue?.toLocaleString() || 'N/A'}
                    </span></p>
                    <p className="text-sm text-gray-600">Market Rate: <span className="font-medium text-gray-900">
                      ${file.propertyData?.valuation.marketRate || 'N/A'}/sq ft
                    </span></p>
                    <p className="text-sm text-gray-600">Condition: <span className="font-medium text-gray-900">{file.validationData?.propertyCondition || 'N/A'}</span></p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/verification/${file.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Review File</span>
                </button>
              </div>
            ))}
            
            {pendingVerification.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No files pending verification.</p>
              </div>
            )}
          </div>
        </div>

        {/* Ready to Print */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Ready to Print</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {readyToPrint.map((file) => (
              <div key={file.id} className="p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg font-semibold text-gray-900">{file.fileId}</span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Verified
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Bank: <span className="font-medium text-gray-900">{file.bankName}</span></p>
                  <p className="text-sm text-gray-600">Property: <span className="font-medium text-gray-900">{file.propertyAddress}</span></p>
                  <p className="text-sm text-gray-500">Verified: {new Date(file.updatedAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handlePrint(file.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print & Complete</span>
                </button>
              </div>
            ))}
            
            {readyToPrint.length === 0 && (
              <div className="text-center py-12">
                <Printer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No files ready to print.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};