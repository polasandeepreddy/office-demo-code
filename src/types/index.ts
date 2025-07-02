export interface User {
  full_name: ReactNode;
  mobile_number: ReactNode;
  position_display: string;
  is_active: any;
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  position: 'coordinator' | 'validator' | 'key-in' | 'verification' | 'admin';
  createdAt: string;
}

export interface PropertyFile {
  id: string;
  fileId: string;
  bankName: string;
  propertyAddress: string;
  ownerName: string;
  ownerContact: string;
  coordinatorId: string;
  validatorId: string;
  keyInOperatorId: string;
  status: 'pending' | 'validation' | 'data-entry' | 'verification' | 'ready-to-print' | 'completed';
  createdAt: string;
  updatedAt: string;
  documents: Document[];
  validationData?: ValidationData;
  propertyData?: PropertyData;
  verificationNotes?: string;
  coordinatorComments?: string;
  location?: string;
  village?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ValidationData {
  photos: string[];
  gpsLocation: {
    lat: number;
    lng: number;
  };
  propertyCondition: string;
  accessNotes: string;
  visitDate: string;
  validatedBy: string;
  extendedData?: {
    plotNo: string;
    syNo: string;
    propertyType: string;
    category: string;
    constructionStage: string;
    buildingDetails: {
      noOfFloors: number;
      unitsPerFloor: number;
      totalUnits: number;
      bhkType: string;
      floorWiseDetails: string;
    };
    status: {
      occupancyStatus: string;
      rentalValue: string;
      ageOfBuilding: string;
      appearance: string;
    };
    boundaries: {
      north: string;
      south: string;
      east: string;
      west: string;
    };
    propertyDetails: {
      roadWidth: string;
      roadType: string;
      propertyIdentification: string;
      plotArea: string;
      plinthArea: string;
      slabArea: string;
    };
    rates: {
      perSqYd: string;
      perSft: string;
      perAcre: string;
      enquiredRatesRange: string;
      valuatorOpinion: string;
      villaPrice: string;
    };
    setbacks: {
      north: string;
      south: string;
      east: string;
      west: string;
    };
    additionalInfo: {
      landmark: string;
      rateEnquiredWith: string;
      realEstateNumber: string;
      inspectedWith: string;
      contactNo: string;
      loanType: string;
      reasonForDelay: string;
    };
  };
}

export interface PropertyData {
  measurements: {
    length: number;
    width: number;
    area: number;
  };
  constructionDetails: {
    type: string;
    material: string;
    condition: string;
    yearBuilt: number;
  };
  valuation: {
    estimatedValue: number;
    marketRate: number;
    notes: string;
  };
  enteredBy: string;
  entryDate: string;
  customData?: {
    format: string;
    fields: {[key: string]: any};
  };
}