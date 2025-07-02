import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../Layout';
import { 
  Ruler, 
  Home, 
  DollarSign, 
  ArrowLeft,
  Save,
  FileText,
  Plus,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { fileService } from '../../services/localStorage';
import { PropertyFile, PropertyData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface FileFormat {
  id: string;
  name: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    required: boolean;
    options?: string[];
  }[];
}

const FILE_FORMATS: FileFormat[] = [
  {
    id: 'residential',
    name: 'Residential Property',
    fields: [
      { id: 'bedrooms', label: 'Number of Bedrooms', type: 'number', required: true },
      { id: 'bathrooms', label: 'Number of Bathrooms', type: 'number', required: true },
      { id: 'parking', label: 'Parking Spaces', type: 'number', required: false },
      { id: 'garden', label: 'Garden Area (sq ft)', type: 'number', required: false },
      { id: 'amenities', label: 'Amenities', type: 'textarea', required: false }
    ]
  },
  {
    id: 'commercial',
    name: 'Commercial Property',
    fields: [
      { id: 'floors', label: 'Number of Floors', type: 'number', required: true },
      { id: 'units', label: 'Number of Units', type: 'number', required: true },
      { id: 'parking_spaces', label: 'Parking Spaces', type: 'number', required: false },
      { id: 'elevator', label: 'Elevator Available', type: 'select', required: true, options: ['Yes', 'No'] },
      { id: 'business_type', label: 'Suitable Business Type', type: 'textarea', required: false }
    ]
  },
  {
    id: 'industrial',
    name: 'Industrial Property',
    fields: [
      { id: 'warehouse_area', label: 'Warehouse Area (sq ft)', type: 'number', required: true },
      { id: 'office_area', label: 'Office Area (sq ft)', type: 'number', required: false },
      { id: 'loading_docks', label: 'Loading Docks', type: 'number', required: false },
      { id: 'power_supply', label: 'Power Supply (KW)', type: 'number', required: false },
      { id: 'machinery', label: 'Existing Machinery', type: 'textarea', required: false }
    ]
  },
  {
    id: 'land',
    name: 'Land/Plot',
    fields: [
      { id: 'zoning', label: 'Zoning Classification', type: 'select', required: true, options: ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Use'] },
      { id: 'soil_type', label: 'Soil Type', type: 'text', required: false },
      { id: 'water_access', label: 'Water Access', type: 'select', required: false, options: ['Municipal', 'Well', 'None'] },
      { id: 'road_access', label: 'Road Access', type: 'select', required: true, options: ['Paved', 'Gravel', 'Dirt', 'No Direct Access'] },
      { id: 'utilities', label: 'Available Utilities', type: 'textarea', required: false }
    ]
  },
  {
    id: 'luxury_residential',
    name: 'Luxury Residential',
    fields: [
      { id: 'master_bedrooms', label: 'Master Bedrooms', type: 'number', required: true },
      { id: 'guest_rooms', label: 'Guest Rooms', type: 'number', required: false },
      { id: 'swimming_pool', label: 'Swimming Pool', type: 'select', required: false, options: ['Indoor', 'Outdoor', 'Both', 'None'] },
      { id: 'garage_capacity', label: 'Garage Capacity', type: 'number', required: false },
      { id: 'luxury_features', label: 'Luxury Features', type: 'textarea', required: false }
    ]
  },
  {
    id: 'mixed_use',
    name: 'Mixed Use Property',
    fields: [
      { id: 'residential_units', label: 'Residential Units', type: 'number', required: true },
      { id: 'commercial_units', label: 'Commercial Units', type: 'number', required: true },
      { id: 'total_floors', label: 'Total Floors', type: 'number', required: true },
      { id: 'common_areas', label: 'Common Areas (sq ft)', type: 'number', required: false },
      { id: 'usage_restrictions', label: 'Usage Restrictions', type: 'textarea', required: false }
    ]
  }
];

export const DataEntryForm: React.FC = () => {
  const navigate = useNavigate();
  const { fileId } = useParams<{ fileId: string }>();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [file, setFile] = useState<PropertyFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [customFields, setCustomFields] = useState<{[key: string]: any}>({});
  const [propertyData, setPropertyData] = useState({
    measurements: {
      length: '',
      width: '',
      area: ''
    },
    constructionDetails: {
      type: '',
      material: '',
      condition: '',
      yearBuilt: ''
    },
    valuation: {
      estimatedValue: '',
      marketRate: '',
      notes: ''
    }
  });

  useEffect(() => {
    if (fileId) {
      const foundFile = fileService.getById(fileId);
      if (foundFile) {
        setFile(foundFile);
        // Real-time notification when file is loaded
        addNotification({
          type: 'info',
          title: '📋 File Loaded',
          message: `Property file ${foundFile.fileId} is ready for data entry.`
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

  const calculateArea = () => {
    const length = parseFloat(propertyData.measurements.length);
    const width = parseFloat(propertyData.measurements.width);
    if (length && width) {
      const area = length * width;
      setPropertyData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          area: area.toString()
        }
      }));
      
      // Real-time notification for area calculation
      addNotification({
        type: 'success',
        title: '📐 Area Calculated',
        message: `Property area calculated: ${area.toLocaleString()} sq ft`
      });
    }
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFields(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFormatChange = (formatId: string) => {
    setSelectedFormat(formatId);
    setCustomFields({});
    
    if (formatId) {
      const format = FILE_FORMATS.find(f => f.id === formatId);
      addNotification({
        type: 'info',
        title: '🏗️ Format Selected',
        message: `Property format changed to: ${format?.name}`
      });
    }
  };

  const submitPropertyData = async () => {
    if (!file || !user) return;

    setIsSubmitting(true);

    try {
      const propertyDataToSave: PropertyData = {
        measurements: {
          length: parseFloat(propertyData.measurements.length),
          width: parseFloat(propertyData.measurements.width),
          area: parseFloat(propertyData.measurements.area)
        },
        constructionDetails: {
          type: propertyData.constructionDetails.type,
          material: propertyData.constructionDetails.material,
          condition: propertyData.constructionDetails.condition,
          yearBuilt: parseInt(propertyData.constructionDetails.yearBuilt)
        },
        valuation: {
          estimatedValue: parseFloat(propertyData.valuation.estimatedValue),
          marketRate: parseFloat(propertyData.valuation.marketRate),
          notes: propertyData.valuation.notes
        },
        enteredBy: user.id,
        entryDate: new Date().toISOString(),
        customData: {
          format: selectedFormat,
          fields: customFields
        }
      };

      fileService.updatePropertyData(file.id, propertyDataToSave);
      
      // Real-time notifications for data entry completion
      addNotification({
        type: 'success',
        title: '🎉 Data Entry Completed!',
        message: `Property data for file ${file.fileId} has been entered and sent for verification.`
      });

      setTimeout(() => {
        addNotification({
          type: 'info',
          title: '🔍 Verification Initiated',
          message: `Verification department has been notified about file ${file.fileId}.`
        });
      }, 2000);

      navigate('/dashboard');
    } catch (error) {
      addNotification({
        type: 'error',
        title: '❌ Data Entry Error',
        message: 'There was an error submitting the property data. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFormatData = FILE_FORMATS.find(f => f.id === selectedFormat);

  if (!file) {
    return (
      <Layout title="Property Data Entry">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property file...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Property Data Entry">
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
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Property Data Entry - {file.fileId}</h1>
                  <p className="text-gray-600">Enter detailed property measurements and data</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Validation Data */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Property Information</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Bank:</span>
                    <p className="font-medium">{file.bankName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="font-medium">{file.propertyAddress}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Owner:</span>
                    <p className="font-medium">{file.ownerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Condition:</span>
                    <p className="font-medium">{file.validationData?.propertyCondition || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {file.validationData && file.validationData.photos.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Property Photos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {file.validationData.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Property photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Middle Column - Basic Data Entry */}
            <div className="space-y-6">
              {/* Measurements */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <Ruler className="h-5 w-5 mr-2" />
                  Measurements
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Length (ft) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={propertyData.measurements.length}
                        onChange={(e) => setPropertyData(prev => ({
                          ...prev,
                          measurements: { ...prev.measurements, length: e.target.value }
                        }))}
                        onBlur={calculateArea}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width (ft) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={propertyData.measurements.width}
                        onChange={(e) => setPropertyData(prev => ({
                          ...prev,
                          measurements: { ...prev.measurements, width: e.target.value }
                        }))}
                        onBlur={calculateArea}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Area (sq ft) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={propertyData.measurements.area}
                      onChange={(e) => setPropertyData(prev => ({
                        ...prev,
                        measurements: { ...prev.measurements, area: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Construction Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Construction Details
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Type *
                      </label>
                      <select
                        value={propertyData.constructionDetails.type}
                        onChange={(e) => setPropertyData(prev => ({
                          ...prev,
                          constructionDetails: { ...prev.constructionDetails, type: e.target.value }
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select type</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="land">Land/Plot</option>
                        <option value="mixed-use">Mixed Use</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Construction Material *
                      </label>
                      <select
                        value={propertyData.constructionDetails.material}
                        onChange={(e) => setPropertyData(prev => ({
                          ...prev,
                          constructionDetails: { ...prev.constructionDetails, material: e.target.value }
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select material</option>
                        <option value="brick">Brick</option>
                        <option value="concrete">Concrete</option>
                        <option value="wood">Wood</option>
                        <option value="steel">Steel</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Construction Condition *
                      </label>
                      <select
                        value={propertyData.constructionDetails.condition}
                        onChange={(e) => setPropertyData(prev => ({
                          ...prev,
                          constructionDetails: { ...prev.constructionDetails, condition: e.target.value }
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select condition</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="under-renovation">Under Renovation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year Built *
                      </label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={propertyData.constructionDetails.yearBuilt}
                        onChange={(e) => setPropertyData(prev => ({
                          ...prev,
                          constructionDetails: { ...prev.constructionDetails, yearBuilt: e.target.value }
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Valuation */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Valuation Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Value ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={propertyData.valuation.estimatedValue}
                      onChange={(e) => setPropertyData(prev => ({
                        ...prev,
                        valuation: { ...prev.valuation, estimatedValue: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Market Rate ($ per sq ft) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={propertyData.valuation.marketRate}
                      onChange={(e) => setPropertyData(prev => ({
                        ...prev,
                        valuation: { ...prev.valuation, marketRate: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valuation Notes
                    </label>
                    <textarea
                      rows={3}
                      value={propertyData.valuation.notes}
                      onChange={(e) => setPropertyData(prev => ({
                        ...prev,
                        valuation: { ...prev.valuation, notes: e.target.value }
                      }))}
                      placeholder="Additional valuation notes or factors considered..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Custom File Format */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Property Format</h4>
                <select
                  value={selectedFormat}
                  onChange={(e) => handleFormatChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select property format</option>
                  {FILE_FORMATS.map(format => (
                    <option key={format.id} value={format.id}>
                      {format.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedFormatData && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">
                    {selectedFormatData.name} Details
                  </h4>
                  <div className="space-y-4">
                    {selectedFormatData.fields.map(field => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label} {field.required && '*'}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={customFields[field.id] || ''}
                            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="">Select {field.label.toLowerCase()}</option>
                            {field.options?.map(option => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            value={customFields[field.id] || ''}
                            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={customFields[field.id] || ''}
                            onChange={(e) => handleCustomFieldChange(field.id, field.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-8 mt-8 border-t border-gray-200">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={submitPropertyData}
              disabled={isSubmitting || !propertyData.measurements.area || !propertyData.constructionDetails.type || !propertyData.valuation.estimatedValue}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Submit Data Entry</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};