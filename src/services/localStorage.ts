// Local Storage Service for PropertyFlow
import { User, PropertyFile, ValidationData, PropertyData } from '../types';

const STORAGE_KEYS = {
  USERS: 'propertyflow_users',
  FILES: 'propertyflow_files',
  CURRENT_USER: 'propertyflow_current_user',
  SETTINGS: 'propertyflow_settings'
};

// Initialize default data if not exists
const initializeDefaultData = () => {
  // Default users
  const defaultUsers: User[] = [
    {
      id: '1',
      fullName: 'John Smith',
      email: 'admin@propertyflow.com',
      mobileNumber: '+1234567890',
      position: 'admin',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      fullName: 'Sarah Johnson',
      email: 'coordinator@propertyflow.com',
      mobileNumber: '+1234567891',
      position: 'coordinator',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      fullName: 'Mike Wilson',
      email: 'validator@propertyflow.com',
      mobileNumber: '+1234567892',
      position: 'validator',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      fullName: 'Emma Davis',
      email: 'keyin@propertyflow.com',
      mobileNumber: '+1234567893',
      position: 'key-in',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      fullName: 'Robert Brown',
      email: 'verification@propertyflow.com',
      mobileNumber: '+1234567894',
      position: 'verification',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  // Default sample files
  const defaultFiles: PropertyFile[] = [
    {
      id: '1',
      fileId: 'PF001',
      bankName: 'State Bank',
      propertyAddress: '123 Main St, Downtown',
      ownerName: 'John Doe',
      ownerContact: '+1234567890',
      coordinatorId: '2',
      validatorId: '3',
      keyInOperatorId: '4',
      status: 'validation',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      documents: [],
      validationData: {
        photos: ['https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=400'],
        gpsLocation: { lat: 40.7128, lng: -74.0060 },
        propertyCondition: 'Good',
        accessNotes: 'Easy access, owner cooperative',
        visitDate: '2024-01-16',
        validatedBy: '3'
      }
    },
    {
      id: '2',
      fileId: 'PF002',
      bankName: 'City Bank',
      propertyAddress: '456 Oak Ave, Central',
      ownerName: 'Jane Smith',
      ownerContact: '+1234567891',
      coordinatorId: '2',
      validatorId: '3',
      keyInOperatorId: '4',
      status: 'data-entry',
      createdAt: '2024-01-14T00:00:00Z',
      updatedAt: '2024-01-14T00:00:00Z',
      documents: []
    },
    {
      id: '3',
      fileId: 'PF003',
      bankName: 'Union Bank',
      propertyAddress: '789 Pine St, West Side',
      ownerName: 'Bob Johnson',
      ownerContact: '+1234567892',
      coordinatorId: '2',
      validatorId: '3',
      keyInOperatorId: '4',
      status: 'verification',
      createdAt: '2024-01-13T00:00:00Z',
      updatedAt: '2024-01-13T00:00:00Z',
      documents: [],
      validationData: {
        photos: ['https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=400'],
        gpsLocation: { lat: 40.7589, lng: -73.9851 },
        propertyCondition: 'Excellent',
        accessNotes: 'New construction, well maintained',
        visitDate: '2024-01-14',
        validatedBy: '3'
      },
      propertyData: {
        measurements: { length: 50, width: 30, area: 1500 },
        constructionDetails: { 
          type: 'Residential', 
          material: 'Brick', 
          condition: 'Good', 
          yearBuilt: 2015 
        },
        valuation: { 
          estimatedValue: 250000, 
          marketRate: 167, 
          notes: 'Good location, well maintained' 
        },
        enteredBy: '4',
        entryDate: '2024-01-15'
      }
    }
  ];

  // Initialize if not exists
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.FILES)) {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(defaultFiles));
  }
};

// User Management
export const userService = {
  getAll: (): User[] => {
    initializeDefaultData();
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },

  getById: (id: string): User | null => {
    const users = userService.getAll();
    return users.find(user => user.id === id) || null;
  },

  getByEmail: (email: string): User | null => {
    const users = userService.getAll();
    return users.find(user => user.email === email) || null;
  },

  create: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const users = userService.getAll();
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  update: (id: string, userData: Partial<User>): User | null => {
    const users = userService.getAll();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return users[index];
    }
    return null;
  },

  delete: (id: string): boolean => {
    const users = userService.getAll();
    const filteredUsers = users.filter(user => user.id !== id);
    if (filteredUsers.length !== users.length) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
      return true;
    }
    return false;
  },

  getByPosition: (position: User['position']): User[] => {
    const users = userService.getAll();
    return users.filter(user => user.position === position);
  }
};

// File Management
export const fileService = {
  getAll: (): PropertyFile[] => {
    initializeDefaultData();
    const files = localStorage.getItem(STORAGE_KEYS.FILES);
    return files ? JSON.parse(files) : [];
  },

  getById: (id: string): PropertyFile | null => {
    const files = fileService.getAll();
    return files.find(file => file.id === id) || null;
  },

  getByFileId: (fileId: string): PropertyFile | null => {
    const files = fileService.getAll();
    return files.find(file => file.fileId === fileId) || null;
  },

  create: (fileData: Omit<PropertyFile, 'id' | 'createdAt' | 'updatedAt'>): PropertyFile => {
    const files = fileService.getAll();
    const newFile: PropertyFile = {
      ...fileData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    files.push(newFile);
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
    return newFile;
  },

  update: (id: string, fileData: Partial<PropertyFile>): PropertyFile | null => {
    const files = fileService.getAll();
    const index = files.findIndex(file => file.id === id);
    if (index !== -1) {
      files[index] = { 
        ...files[index], 
        ...fileData, 
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
      return files[index];
    }
    return null;
  },

  delete: (id: string): boolean => {
    const files = fileService.getAll();
    const filteredFiles = files.filter(file => file.id !== id);
    if (filteredFiles.length !== files.length) {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(filteredFiles));
      return true;
    }
    return false;
  },

  getByStatus: (status: PropertyFile['status']): PropertyFile[] => {
    const files = fileService.getAll();
    return files.filter(file => file.status === status);
  },

  getByAssignee: (userId: string, role: 'coordinator' | 'validator' | 'keyInOperator'): PropertyFile[] => {
    const files = fileService.getAll();
    switch (role) {
      case 'coordinator':
        return files.filter(file => file.coordinatorId === userId);
      case 'validator':
        return files.filter(file => file.validatorId === userId);
      case 'keyInOperator':
        return files.filter(file => file.keyInOperatorId === userId);
      default:
        return [];
    }
  },

  updateValidationData: (fileId: string, validationData: ValidationData): PropertyFile | null => {
    return fileService.update(fileId, { 
      validationData, 
      status: 'data-entry' 
    });
  },

  updatePropertyData: (fileId: string, propertyData: PropertyData): PropertyFile | null => {
    return fileService.update(fileId, { 
      propertyData, 
      status: 'verification' 
    });
  },

  markReadyToPrint: (fileId: string, verificationNotes?: string): PropertyFile | null => {
    return fileService.update(fileId, { 
      status: 'ready-to-print',
      verificationNotes 
    });
  },

  markCompleted: (fileId: string): PropertyFile | null => {
    return fileService.update(fileId, { 
      status: 'completed' 
    });
  }
};

// Authentication
export const authService = {
  login: (email: string, password: string): User | null => {
    const user = userService.getByEmail(email);
    if (user && password === 'password123') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser();
  }
};

// Statistics and Analytics
export const statsService = {
  getOverallStats: () => {
    const files = fileService.getAll();
    const users = userService.getAll();
    
    return {
      totalFiles: files.length,
      pendingFiles: files.filter(f => f.status === 'pending').length,
      validationFiles: files.filter(f => f.status === 'validation').length,
      dataEntryFiles: files.filter(f => f.status === 'data-entry').length,
      verificationFiles: files.filter(f => f.status === 'verification').length,
      readyToPrintFiles: files.filter(f => f.status === 'ready-to-print').length,
      completedFiles: files.filter(f => f.status === 'completed').length,
      totalUsers: users.length,
      coordinators: users.filter(u => u.position === 'coordinator').length,
      validators: users.filter(u => u.position === 'validator').length,
      keyInOperators: users.filter(u => u.position === 'key-in').length,
      verificationOfficers: users.filter(u => u.position === 'verification').length,
      admins: users.filter(u => u.position === 'admin').length
    };
  },

  getUserStats: (userId: string) => {
    const files = fileService.getAll();
    const user = userService.getById(userId);
    
    if (!user) return null;

    let userFiles: PropertyFile[] = [];
    
    switch (user.position) {
      case 'coordinator':
        userFiles = files.filter(f => f.coordinatorId === userId);
        break;
      case 'validator':
        userFiles = files.filter(f => f.validatorId === userId);
        break;
      case 'key-in':
        userFiles = files.filter(f => f.keyInOperatorId === userId);
        break;
      case 'verification':
        userFiles = files.filter(f => f.status === 'verification' || f.status === 'ready-to-print');
        break;
      case 'admin':
        userFiles = files;
        break;
    }

    return {
      totalAssigned: userFiles.length,
      pending: userFiles.filter(f => f.status === 'pending').length,
      inProgress: userFiles.filter(f => ['validation', 'data-entry', 'verification'].includes(f.status)).length,
      completed: userFiles.filter(f => ['ready-to-print', 'completed'].includes(f.status)).length,
      thisWeek: userFiles.filter(f => {
        const fileDate = new Date(f.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return fileDate >= weekAgo;
      }).length,
      thisMonth: userFiles.filter(f => {
        const fileDate = new Date(f.createdAt);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return fileDate >= monthAgo;
      }).length
    };
  }
};

// Utility functions
export const generateFileId = (): string => {
  const files = fileService.getAll();
  const lastFileNumber = files.length > 0 
    ? Math.max(...files.map(f => parseInt(f.fileId.replace('PF', '')) || 0))
    : 0;
  return `PF${String(lastFileNumber + 1).padStart(3, '0')}`;
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export const exportData = () => {
  const data = {
    users: userService.getAll(),
    files: fileService.getAll(),
    exportDate: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.users && data.files) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(data.files));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};