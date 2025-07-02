import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../Layout';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  ArrowLeft,
  Save,
  FileCheck
} from 'lucide-react';
import { fileService } from '../../services/localStorage';
import { PropertyFile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

export const VerificationForm: React.FC = () => {
  const navigate = useNavigate();
  const { fileId } = useParams<{ fileId: string }>();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [file, setFile] = useState<PropertyFile | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklist, setChecklist] = useState({
    addressMatch: false,
    measurementsReasonable: false,
    valuationAppropriate: false,
    constructionAccurate: false,
    documentationComplete: false
  });

  useEffect(() => {
    if (fileId) {
      const foundFile = fileService.getById(fileId);
      if (foundFile) {
        setFile(foundFile);
        // Real-time notification when file is loaded for verification
        addNotification({
          type: 'info',
          title: '🔍 File Ready for Verification',
          message: `Property file ${foundFile.fileId} is loaded for final verification.`
        });
      } else {
        addNotification({
          type: 'error',
          title: '❌ File Not Found',
          message: 'The requested property file could not be found.'
        });
        navigate('/dashboard');
      }
    }
  }, [fileId, navigate, addNotification]);

  const handleApprove = async () => {
    if (!file) return;

    setIsSubmitting(true);

    try {
      fileService.markReadyToPrint(file.id, verificationNotes);
      
      // Real-time notifications for approval
      addNotification({
        type: 'success',
        title: '✅ File Approved!',
        message: `Property file ${file.fileId} has been approved and marked ready to print.`
      });

      setTimeout(() => {
        addNotification({
          type: 'info',
          title: '🖨️ Ready for Printing',
          message: `File ${file.fileId} is now in the print queue and ready for final completion.`
        });
      }, 2000);

      navigate('/dashboard');
    } catch (error) {
      addNotification({
        type: 'error',
        title: '❌ Approval Error',
        message: 'There was an error approving the file. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!file) return;

    setIsSubmitting(true);

    try {
      fileService.update(file.id, { 
        status: 'data-entry',
        verificationNotes: verificationNotes 
      });
      
      // Real-time notifications for rejection
      addNotification({
        type: 'warning',
        title: '⚠️ File Rejected',
        message: `Property file ${file.fileId} has been sent back for corrections.`
      });

      setTimeout(() => {
        addNotification({
          type: 'info',
          title: '🔄 Correction Required',
          message: `Key-In operator has been notified to make corrections to file ${file.fileId}.`
        });
      }, 2000);

      navigate('/dashboard');
    } catch (error) {
      addNotification({
        type: 'error',
        title: '❌ Rejection Error',
        message: 'There was an error rejecting the file. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChecklistChange = (key: string, value: boolean) => {
    setChecklist(prev => ({ ...prev, [key]: value }));
    
    // Real-time notification for checklist updates
    const checklistLabels: {[key: string]: string} = {
      addressMatch: 'Address verification',
      measurementsReasonable: 'Measurements verification',
      valuationAppropriate: 'Valuation verification',
      constructionAccurate: 'Construction details verification',
      documentationComplete: 'Documentation verification'
    };
    
    addNotification({
      type: value ? 'success' : 'info',
      title: value ? '✅ Verification Complete' : '📋 Verification Updated',
      message: `${checklistLabels[key]} ${value ? 'completed' : 'updated'}.`
    });
  };

  if (!file) {
    return (
      <Layout title="File Verification">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property file...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="File Verification">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-amber-600 to-red-600 p-3 rounded-xl">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">File Verification - {file.fileId}</h1>
                  <p className="text-gray-600">Review and verify all property data</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                editMode 
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Edit3 className="h-4 w-4 inline mr-1" />
              {editMode ? 'View Mode' : 'Edit Mode'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Property Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Property Information</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Bank:</span>
                    <p className="font-medium">{file.bankName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Owner:</span>
                    <p className="font-medium">{file.ownerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="font-medium">{file.propertyAddress}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Contact:</span>
                    <p className="font-medium">{file.ownerContact}</p>
                  </div>
                </div>
              </div>

              {file.propertyData && (
                <>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">Measurements</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Length:</span>
                        <p className="font-medium">{file.propertyData.measurements.length} ft</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Width:</span>
                        <p className="font-medium">{file.propertyData.measurements.width} ft</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Area:</span>
                        <p className="font-medium">{file.propertyData.measurements.area} sq ft</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">Construction Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <p className="font-medium">{file.propertyData.constructionDetails.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Material:</span>
                        <p className="font-medium">{file.propertyData.constructionDetails.material}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Condition:</span>
                        <p className="font-medium">{file.propertyData.constructionDetails.condition}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Year Built:</span>
                        <p className="font-medium">{file.propertyData.constructionDetails.yearBuilt}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {file.validationData && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Validation Data</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Property Condition:</span>
                      <p className="font-medium">{file.validationData.propertyCondition}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Access Notes:</span>
                      <p className="font-medium">{file.validationData.accessNotes}</p>
                    </div>
                    {file.validationData.photos.length > 0 && (
                      <div>
                        <span className="text-gray-600">Photos:</span>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {file.validationData.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Property photo ${index + 1}`}
                              className="w-full h-16 object-cover rounded border border-gray-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Middle Column - Valuation & Custom Data */}
            <div className="space-y-6">
              {file.propertyData && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Valuation Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Estimated Value:</span>
                      <p className="text-lg font-bold text-green-600">
                        ${file.propertyData.valuation.estimatedValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Market Rate:</span>
                      <p className="font-medium">${file.propertyData.valuation.marketRate}/sq ft</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Valuation Notes:</span>
                      <p className="font-medium">{file.propertyData.valuation.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {file.propertyData?.customData && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">
                    {file.propertyData.customData.format} Details
                  </h4>
                  <div className="space-y-3 text-sm">
                    {Object.entries(file.propertyData.customData.fields).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-600">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Verification Checklist</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={checklist.addressMatch}
                      onChange={(e) => handleChecklistChange('addressMatch', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Address matches validation data</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={checklist.measurementsReasonable}
                      onChange={(e) => handleChecklistChange('measurementsReasonable', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Measurements are reasonable</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={checklist.valuationAppropriate}
                      onChange={(e) => handleChecklistChange('valuationAppropriate', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Valuation is market appropriate</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={checklist.constructionAccurate}
                      onChange={(e) => handleChecklistChange('constructionAccurate', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Construction details are accurate</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={checklist.documentationComplete}
                      onChange={(e) => handleChecklistChange('documentationComplete', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">All required documentation present</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Verification Notes */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Verification Notes</h4>
                <textarea
                  rows={8}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add verification notes, corrections, or observations..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-md font-semibold text-blue-800 mb-3">Verification Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">File ID:</span>
                    <span className="font-medium text-blue-900">{file.fileId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Created:</span>
                    <span className="font-medium text-blue-900">{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Last Updated:</span>
                    <span className="font-medium text-blue-900">{new Date(file.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Status:</span>
                    <span className="font-medium text-blue-900 capitalize">{file.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-8 mt-8 border-t border-gray-200">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span>Reject & Send Back</span>
                </>
              )}
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Approve & Mark Ready to Print</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};