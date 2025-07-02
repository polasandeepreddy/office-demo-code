import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../Layout';
import { 
  MapPin, 
  Camera, 
  Upload, 
  Navigation,
  ArrowLeft,
  Save,
  Building2,
  FileText,
  Home,
  Users,
  Calendar
} from 'lucide-react';
import { fileService } from '../../services/localStorage';
import { PropertyFile, ValidationData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const PROPERTY_TYPES = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Plot/Land'];
const CATEGORIES = ['Individual House', 'Apartment', 'Villa', 'Plot', 'Commercial Building', 'Warehouse', 'Office Space'];
const CONSTRUCTION_STAGES = ['Completed', 'Under Construction', 'Foundation', 'Plinth', 'Lintel', 'Roof', 'Finishing'];
const BHK_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'Studio', 'Duplex', 'Penthouse'];
const STATUS_OPTIONS = ['Vacant', 'Self-Occupied', 'Rented'];
const APPEARANCE_OPTIONS = ['Average', 'Good', 'Poor'];

export const ValidationForm: React.FC = () => {
  const navigate = useNavigate();
  const { fileId } = useParams<{ fileId: string }>();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [file, setFile] = useState<PropertyFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [validationData, setValidationData] = useState({
    // Basic Information
    siteVisitDate: new Date().toISOString().split('T')[0],
    plotNo: '',
    syNo: '',
    propertyType: '',
    category: '',
    constructionStage: '',
    
    // Building Details
    noOfFloors: '',
    unitsPerFloor: '',
    totalUnits: '',
    bhkType: '',
    floorWiseDetails: '',
    
    // Status
    occupancyStatus: '',
    rentalValue: '',
    ageOfBuilding: '',
    appearance: '',
    
    // Location Details
    landmark: '',
    latitude: '',
    longitude: '',
    
    // Boundaries
    northBoundary: '',
    southBoundary: '',
    eastBoundary: '',
    westBoundary: '',
    
    // Property Details
    roadWidth: '',
    roadType: '',
    propertyIdentification: '',
    plotArea: '',
    plinthArea: '',
    slabArea: '',
    perSqYd: '',
    perSft: '',
    perAcre: '',
    enquiredRatesRange: '',
    valuatorOpinion: '',
    villaPrice: '',
    
    // Contact Details
    rateEnquiredWith: '',
    realEstateNumber: '',
    
    // Set-back Lengths
    northSetback: '',
    southSetback: '',
    eastSetback: '',
    westSetback: '',
    
    // Additional Information
    observations: '',
    inspectedWith: '',
    contactNo: '',
    assignedBy: '',
    refFile: '',
    loanType: '',
    bankFI: '',
    assignedOn: '',
    completedOn: '',
    visitDoneBy: '',
    reasonForDelay: ''
  });

  useEffect(() => {
    if (fileId) {
      const foundFile = fileService.getById(fileId);
      if (foundFile) {
        setFile(foundFile);
        // Pre-fill some data from the file
        setValidationData(prev => ({
          ...prev,
          bankFI: foundFile.bankName,
          assignedBy: 'Coordinator',
          refFile: foundFile.fileId,
          visitDoneBy: user?.fullName || '',
          assignedOn: new Date(foundFile.createdAt).toISOString().split('T')[0]
        }));
        
        addNotification({
          type: 'info',
          title: '📋 Validation Form Loaded',
          message: `Property file ${foundFile.fileId} is ready for site validation.`
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
  }, [fileId, navigate, addNotification, user]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).map((file) => {
        return URL.createObjectURL(file);
      });
      setPhotos(prev => [...prev, ...newPhotos]);
      
      addNotification({
        type: 'success',
        title: '📸 Photos Uploaded',
        message: `${newPhotos.length} photo(s) added to validation data.`
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      addNotification({
        type: 'info',
        title: '📍 Getting Location...',
        message: 'Accessing GPS coordinates for property location.'
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValidationData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          addNotification({
            type: 'success',
            title: '✅ Location Captured',
            message: `GPS coordinates captured: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          });
        },
        (error) => {
          addNotification({
            type: 'error',
            title: '❌ Location Error',
            message: 'Unable to get current location. Please enter coordinates manually.'
          });
        }
      );
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    addNotification({
      type: 'info',
      title: '🗑️ Photo Removed',
      message: 'Photo has been removed from validation data.'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setValidationData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalUnits = () => {
    const floors = parseInt(validationData.noOfFloors) || 0;
    const unitsPerFloor = parseInt(validationData.unitsPerFloor) || 0;
    const total = floors * unitsPerFloor;
    setValidationData(prev => ({ ...prev, totalUnits: total.toString() }));
  };

  const submitValidation = async () => {
    if (!file || !user) return;

    setIsSubmitting(true);

    try {
      const validationDataToSave: ValidationData = {
        photos: photos,
        gpsLocation: {
          lat: parseFloat(validationData.latitude) || 0,
          lng: parseFloat(validationData.longitude) || 0
        },
        propertyCondition: validationData.appearance,
        accessNotes: validationData.observations,
        visitDate: validationData.siteVisitDate,
        validatedBy: user.id,
        // Extended validation data
        extendedData: {
          plotNo: validationData.plotNo,
          syNo: validationData.syNo,
          propertyType: validationData.propertyType,
          category: validationData.category,
          constructionStage: validationData.constructionStage,
          buildingDetails: {
            noOfFloors: parseInt(validationData.noOfFloors) || 0,
            unitsPerFloor: parseInt(validationData.unitsPerFloor) || 0,
            totalUnits: parseInt(validationData.totalUnits) || 0,
            bhkType: validationData.bhkType,
            floorWiseDetails: validationData.floorWiseDetails
          },
          status: {
            occupancyStatus: validationData.occupancyStatus,
            rentalValue: validationData.rentalValue,
            ageOfBuilding: validationData.ageOfBuilding,
            appearance: validationData.appearance
          },
          boundaries: {
            north: validationData.northBoundary,
            south: validationData.southBoundary,
            east: validationData.eastBoundary,
            west: validationData.westBoundary
          },
          propertyDetails: {
            roadWidth: validationData.roadWidth,
            roadType: validationData.roadType,
            propertyIdentification: validationData.propertyIdentification,
            plotArea: validationData.plotArea,
            plinthArea: validationData.plinthArea,
            slabArea: validationData.slabArea
          },
          rates: {
            perSqYd: validationData.perSqYd,
            perSft: validationData.perSft,
            perAcre: validationData.perAcre,
            enquiredRatesRange: validationData.enquiredRatesRange,
            valuatorOpinion: validationData.valuatorOpinion,
            villaPrice: validationData.villaPrice
          },
          setbacks: {
            north: validationData.northSetback,
            south: validationData.southSetback,
            east: validationData.eastSetback,
            west: validationData.westSetback
          },
          additionalInfo: {
            landmark: validationData.landmark,
            rateEnquiredWith: validationData.rateEnquiredWith,
            realEstateNumber: validationData.realEstateNumber,
            inspectedWith: validationData.inspectedWith,
            contactNo: validationData.contactNo,
            loanType: validationData.loanType,
            reasonForDelay: validationData.reasonForDelay
          }
        }
      };

      fileService.updateValidationData(file.id, validationDataToSave);
      
      // Real-time notifications for validation completion
      addNotification({
        type: 'success',
        title: '🎉 Site Validation Completed!',
        message: `Property file ${file.fileId} has been successfully validated and moved to data entry queue.`
      });

      setTimeout(() => {
        addNotification({
          type: 'info',
          title: '📋 Next Step Initiated',
          message: `Key-In operator has been notified about file ${file.fileId} for data entry processing.`
        });
      }, 2000);

      setTimeout(() => {
        addNotification({
          type: 'info',
          title: '🔄 Workflow Progress',
          message: `File ${file.fileId} is now in data entry phase. Coordinator has been updated.`
        });
      }, 4000);

      navigate('/dashboard');
    } catch (error) {
      addNotification({
        type: 'error',
        title: '❌ Validation Error',
        message: 'There was an error submitting the validation. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!file) {
    return (
      <Layout title="Property Validation">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property file...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Site Validation Form">
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
                <div className="bg-gradient-to-br from-emerald-600 to-blue-600 p-3 rounded-xl">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Site Validation - {file.fileId}</h1>
                  <p className="text-gray-600">Complete property validation form</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - File Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  File Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">File No/APP ID:</span>
                    <p className="font-medium text-gray-900">{file.fileId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Bank/FI:</span>
                    <p className="font-medium text-gray-900">{file.bankName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Applicant:</span>
                    <p className="font-medium text-gray-900">{file.ownerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Contact:</span>
                    <p className="font-medium text-gray-900">{file.ownerContact}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium text-gray-900">{file.propertyAddress}</p>
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Property Photos *
                </h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Camera className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-2">Upload site photos</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-all duration-200"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Choose Photos
                  </label>
                </div>
                
                {photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Property photo ${index + 1}`}
                          className="w-full h-16 object-cover rounded border border-gray-200"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Form - 3 Columns */}
            <div className="lg:col-span-3 space-y-8">
              {/* Basic Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Basic Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Visit Date *</label>
                    <input
                      type="date"
                      value={validationData.siteVisitDate}
                      onChange={(e) => handleInputChange('siteVisitDate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plot No.</label>
                    <input
                      type="text"
                      value={validationData.plotNo}
                      onChange={(e) => handleInputChange('plotNo', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sy.No.</label>
                    <input
                      type="text"
                      value={validationData.syNo}
                      onChange={(e) => handleInputChange('syNo', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                    <select
                      value={validationData.propertyType}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      {PROPERTY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={validationData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage of Construction</label>
                    <select
                      value={validationData.constructionStage}
                      onChange={(e) => handleInputChange('constructionStage', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Stage</option>
                      {CONSTRUCTION_STAGES.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Building Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Building Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No of Floors</label>
                    <input
                      type="number"
                      value={validationData.noOfFloors}
                      onChange={(e) => handleInputChange('noOfFloors', e.target.value)}
                      onBlur={calculateTotalUnits}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Units Per Floor</label>
                    <input
                      type="number"
                      value={validationData.unitsPerFloor}
                      onChange={(e) => handleInputChange('unitsPerFloor', e.target.value)}
                      onBlur={calculateTotalUnits}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
                    <input
                      type="number"
                      value={validationData.totalUnits}
                      onChange={(e) => handleInputChange('totalUnits', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BHK Type</label>
                    <select
                      value={validationData.bhkType}
                      onChange={(e) => handleInputChange('bhkType', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select BHK</option>
                      {BHK_TYPES.map(bhk => (
                        <option key={bhk} value={bhk}>{bhk}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor Wise Details</label>
                  <textarea
                    rows={2}
                    value={validationData.floorWiseDetails}
                    onChange={(e) => handleInputChange('floorWiseDetails', e.target.value)}
                    placeholder="Mention floor wise details..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status & Appearance */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Status & Appearance</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={validationData.occupancyStatus}
                      onChange={(e) => handleInputChange('occupancyStatus', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rental Value</label>
                    <input
                      type="text"
                      value={validationData.rentalValue}
                      onChange={(e) => handleInputChange('rentalValue', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age of Building</label>
                    <input
                      type="text"
                      value={validationData.ageOfBuilding}
                      onChange={(e) => handleInputChange('ageOfBuilding', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appearance</label>
                    <select
                      value={validationData.appearance}
                      onChange={(e) => handleInputChange('appearance', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {APPEARANCE_OPTIONS.map(app => (
                        <option key={app} value={app}>{app}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location & GPS */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Landmark & Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                    <input
                      type="text"
                      value={validationData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="text"
                      value={validationData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="text"
                      value={validationData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm"
                    >
                      <Navigation className="h-4 w-4" />
                      <span>Get GPS</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Boundaries */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Boundaries (As Per Actual)</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">North</label>
                    <input
                      type="text"
                      value={validationData.northBoundary}
                      onChange={(e) => handleInputChange('northBoundary', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">South</label>
                    <input
                      type="text"
                      value={validationData.southBoundary}
                      onChange={(e) => handleInputChange('southBoundary', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">East</label>
                    <input
                      type="text"
                      value={validationData.eastBoundary}
                      onChange={(e) => handleInputChange('eastBoundary', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">West</label>
                    <input
                      type="text"
                      value={validationData.westBoundary}
                      onChange={(e) => handleInputChange('westBoundary', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details & Rates */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Property Details & Rates</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Road Width & Type</label>
                    <input
                      type="text"
                      value={validationData.roadWidth}
                      onChange={(e) => handleInputChange('roadWidth', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">How Property Identified</label>
                    <input
                      type="text"
                      value={validationData.propertyIdentification}
                      onChange={(e) => handleInputChange('propertyIdentification', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plot Area</label>
                    <input
                      type="text"
                      value={validationData.plotArea}
                      onChange={(e) => handleInputChange('plotArea', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plinth Area</label>
                    <input
                      type="text"
                      value={validationData.plinthArea}
                      onChange={(e) => handleInputChange('plinthArea', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per Sq Yd</label>
                    <input
                      type="text"
                      value={validationData.perSqYd}
                      onChange={(e) => handleInputChange('perSqYd', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slab Area</label>
                    <input
                      type="text"
                      value={validationData.slabArea}
                      onChange={(e) => handleInputChange('slabArea', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per SFT</label>
                    <input
                      type="text"
                      value={validationData.perSft}
                      onChange={(e) => handleInputChange('perSft', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enquired Rates Range</label>
                    <input
                      type="text"
                      value={validationData.enquiredRatesRange}
                      onChange={(e) => handleInputChange('enquiredRatesRange', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per Acre</label>
                    <input
                      type="text"
                      value={validationData.perAcre}
                      onChange={(e) => handleInputChange('perAcre', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valuator's Opinion</label>
                    <input
                      type="text"
                      value={validationData.valuatorOpinion}
                      onChange={(e) => handleInputChange('valuatorOpinion', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Villa Price (LS)</label>
                    <input
                      type="text"
                      value={validationData.villaPrice}
                      onChange={(e) => handleInputChange('villaPrice', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Set-back Lengths */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Set-Back Lengths</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">North</label>
                    <input
                      type="text"
                      value={validationData.northSetback}
                      onChange={(e) => handleInputChange('northSetback', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">South</label>
                    <input
                      type="text"
                      value={validationData.southSetback}
                      onChange={(e) => handleInputChange('southSetback', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">East</label>
                    <input
                      type="text"
                      value={validationData.eastSetback}
                      onChange={(e) => handleInputChange('eastSetback', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">West</label>
                    <input
                      type="text"
                      value={validationData.westSetback}
                      onChange={(e) => handleInputChange('westSetback', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Observations & Additional Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Observations & Additional Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate Enquired With / Real Estate Number</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={validationData.rateEnquiredWith}
                        onChange={(e) => handleInputChange('rateEnquiredWith', e.target.value)}
                        placeholder="Rate enquired with"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={validationData.realEstateNumber}
                        onChange={(e) => handleInputChange('realEstateNumber', e.target.value)}
                        placeholder="Real estate number"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observations / Remarks / Amenities</label>
                    <textarea
                      rows={4}
                      value={validationData.observations}
                      onChange={(e) => handleInputChange('observations', e.target.value)}
                      placeholder="Enter detailed observations, remarks, and amenities..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inspected Along With</label>
                      <input
                        type="text"
                        value={validationData.inspectedWith}
                        onChange={(e) => handleInputChange('inspectedWith', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                      <input
                        type="text"
                        value={validationData.contactNo}
                        onChange={(e) => handleInputChange('contactNo', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
                      <input
                        type="text"
                        value={validationData.loanType}
                        onChange={(e) => handleInputChange('loanType', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Completed On</label>
                      <input
                        type="date"
                        value={validationData.completedOn}
                        onChange={(e) => handleInputChange('completedOn', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Delay</label>
                      <input
                        type="text"
                        value={validationData.reasonForDelay}
                        onChange={(e) => handleInputChange('reasonForDelay', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
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
              onClick={submitValidation}
              disabled={isSubmitting || !validationData.propertyType || photos.length === 0 || !validationData.siteVisitDate}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Submit Validation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};