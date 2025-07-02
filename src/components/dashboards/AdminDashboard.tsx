import React, { useState, useEffect } from 'react';
import { Layout } from '../Layout';
import { 
  Users, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Archive,
  Star,
  Copy,
  X,
  Settings,
  Database,
  Shield,
  BarChart3,
  Globe,
  Zap
} from 'lucide-react';
import { User, PropertyFile } from '../../types';
import { 
  usersAPI, 
  filesAPI, 
  statsAPI, 
  banksAPI, 
  propertyTypesAPI, 
  locationsAPI,
  configAPI,
  authAPI,
  exportData,
  handleApiError
} from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';

export const AdminDashboard: React.FC = () => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'files' | 'master-data' | 'system' | 'audit'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<PropertyFile[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [
        overallStats,
        allUsers,
        allFiles,
        allBanks,
        allPropertyTypes,
        allLocations,
        allConfigs,
        recentAuditLogs
      ] = await Promise.all([
        statsAPI.getOverall(),
        usersAPI.getAll(),
        filesAPI.getAll({ page_size: 100 }),
        banksAPI.getAll(),
        propertyTypesAPI.getAll(),
        locationsAPI.getAll(),
        configAPI.getAll(),
        authAPI.getAll({ page_size: 50 })
      ]);

      setStats(overallStats);
      setUsers(allUsers.results || allUsers);
      setFiles(allFiles.results || allFiles);
      setBanks(allBanks.results || allBanks);
      setPropertyTypes(allPropertyTypes.results || allPropertyTypes);
      setLocations(allLocations.results || allLocations);
      setConfigurations(allConfigs.results || allConfigs);
      setAuditLogs(recentAuditLogs.results || recentAuditLogs);
      
      addNotification({
        type: 'success',
        title: '🔄 Data Refreshed',
        message: 'Admin dashboard data has been updated successfully.'
      });
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      addNotification({
        type: 'error',
        title: '❌ Loading Error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await usersAPI.create(userData);
      addNotification({
        type: 'success',
        title: '👤 User Created',
        message: `${userData.full_name} has been successfully added to the system.`
      });
      loadData();
      setShowModal(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      addNotification({
        type: 'error',
        title: '❌ Creation Error',
        message: errorMessage
      });
    }
  };

  const handleCreateBank = async (bankData: any) => {
    try {
      await banksAPI.create(bankData);
      addNotification({
        type: 'success',
        title: '🏦 Bank Added',
        message: `${bankData.name} has been successfully added to the system.`
      });
      loadData();
      setShowModal(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      addNotification({
        type: 'error',
        title: '❌ Creation Error',
        message: errorMessage
      });
    }
  };

  const handleCreatePropertyType = async (typeData: any) => {
    try {
      await propertyTypesAPI.create(typeData);
      addNotification({
        type: 'success',
        title: '🏠 Property Type Added',
        message: `${typeData.name} has been successfully added to the system.`
      });
      loadData();
      setShowModal(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      addNotification({
        type: 'error',
        title: '❌ Creation Error',
        message: errorMessage
      });
    }
  };

  const handleCreateLocation = async (locationData: any) => {
    try {
      await locationsAPI.create(locationData);
      addNotification({
        type: 'success',
        title: '📍 Location Added',
        message: `${locationData.city}, ${locationData.state} has been successfully added.`
      });
      loadData();
      setShowModal(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      addNotification({
        type: 'error',
        title: '❌ Creation Error',
        message: errorMessage
      });
    }
  };

  const handleCreateConfig = async (configData: any) => {
    try {
      await configAPI.create(configData);
      addNotification({
        type: 'success',
        title: '⚙️ Configuration Added',
        message: `${configData.key} configuration has been successfully added.`
      });
      loadData();
      setShowModal(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      addNotification({
        type: 'error',
        title: '❌ Creation Error',
        message: errorMessage
      });
    }
  };

  const handleDelete = async (type: string, id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        switch (type) {
          case 'user':
            await usersAPI.delete(id);
            break;
          case 'file':
            await filesAPI.delete(id);
            break;
          case 'bank':
            await banksAPI.delete(id);
            break;
          case 'property-type':
            await propertyTypesAPI.delete(id);
            break;
          case 'location':
            await locationsAPI.delete(id);
            break;
          case 'config':
            await configAPI.delete(id);
            break;
        }
        
        addNotification({
          type: 'warning',
          title: '🗑️ Item Deleted',
          message: `${name} has been successfully deleted.`
        });
        loadData();
      } catch (error) {
        const errorMessage = handleApiError(error);
        addNotification({
          type: 'error',
          title: '❌ Delete Error',
          message: errorMessage
        });
      }
    }
  };

  const handleExportData = async (type: string = 'all') => {
    try {
      const success = await exportData(type);
      if (success) {
        addNotification({
          type: 'success',
          title: '📥 Data Exported',
          message: 'System data has been exported successfully.'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: '❌ Export Error',
        message: 'Failed to export data. Please try again.'
      });
    }
  };

  const getRoleColor = (position: string) => {
    switch (position) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'coordinator': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'validator': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'key-in': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'verification': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'validation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'data-entry': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'verification': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready-to-print': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="System Administration">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 bg-white rounded-lg shadow-sm">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'files', label: 'File Management', icon: FileText },
              { id: 'master-data', label: 'Master Data', icon: Database },
              { id: 'system', label: 'System Config', icon: Settings },
              { id: 'audit', label: 'Audit Logs', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Files</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_files || 0}</p>
                  </div>
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.total_users || 0}</p>
                  </div>
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {(stats.validation_files || 0) + (stats.data_entry_files || 0) + (stats.verification_files || 0)}
                    </p>
                  </div>
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed_files || 0}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Health</p>
                    <p className="text-2xl font-bold text-green-600">98%</p>
                  </div>
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Performance</p>
                    <p className="text-2xl font-bold text-blue-600">Excellent</p>
                  </div>
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowModal('create-user')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
                >
                  <Users className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Add User</h4>
                  <p className="text-sm text-gray-600">Create new system user</p>
                </button>

                <button
                  onClick={() => setShowModal('create-bank')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left"
                >
                  <Building className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Add Bank</h4>
                  <p className="text-sm text-gray-600">Register new bank</p>
                </button>

                <button
                  onClick={() => handleExportData()}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left"
                >
                  <Download className="h-6 w-6 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Export Data</h4>
                  <p className="text-sm text-gray-600">Download system backup</p>
                </button>

                <button
                  onClick={() => setActiveTab('system')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 text-left"
                >
                  <Settings className="h-6 w-6 text-orange-600 mb-2" />
                  <h4 className="font-medium text-gray-900">System Config</h4>
                  <p className="text-sm text-gray-600">Manage system settings</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent System Activity</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {auditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="p-4 flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {log.user_name} {log.action_type_display.toLowerCase()} {log.model_name}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                
                {auditLogs.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <button
                onClick={() => setShowModal('create-user')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.mobile_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.position)}`}>
                            {user.position_display || user.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit user"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('user', user.id, user.full_name)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Master Data Tab */}
        {activeTab === 'master-data' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Master Data Management</h2>
            
            {/* Banks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Banks</h3>
                <button
                  onClick={() => setShowModal('create-bank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Bank</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Files</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {banks.map((bank) => (
                      <tr key={bank.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{bank.name}</p>
                            <p className="text-sm text-gray-500">{bank.branch_name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bank.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm text-gray-900">{bank.contact_person}</p>
                            <p className="text-sm text-gray-500">{bank.contact_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bank.files_count || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('bank', bank.id, bank.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Property Types */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Property Types</h3>
                <button
                  onClick={() => setShowModal('create-property-type')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Type</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {propertyTypes.map((type) => (
                  <div key={type.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      <div className="flex space-x-1">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => handleDelete('property-type', type.id, type.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        type.category === 'residential' ? 'bg-green-100 text-green-800' :
                        type.category === 'commercial' ? 'bg-blue-100 text-blue-800' :
                        type.category === 'industrial' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {type.category_display || type.category}
                      </span>
                      <span className="text-xs text-gray-500">{type.files_count || 0} files</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Configuration Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">System Configuration</h2>
              <button
                onClick={() => setShowModal('create-config')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Configuration</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {configurations.map((config) => (
                      <tr key={config.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            config.config_type === 'general' ? 'bg-blue-100 text-blue-800' :
                            config.config_type === 'workflow' ? 'bg-green-100 text-green-800' :
                            config.config_type === 'security' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {config.config_type_display || config.config_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{config.key}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {config.value.length > 50 ? `${config.value.substring(0, 50)}...` : config.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            config.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {config.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('config', config.id, config.key)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showModal === 'create-user' && (
          <UserModal
            onClose={() => setShowModal(null)}
            onSubmit={handleCreateUser}
          />
        )}

        {showModal === 'create-bank' && (
          <BankModal
            onClose={() => setShowModal(null)}
            onSubmit={handleCreateBank}
          />
        )}

        {showModal === 'create-property-type' && (
          <PropertyTypeModal
            onClose={() => setShowModal(null)}
            onSubmit={handleCreatePropertyType}
          />
        )}

        {showModal === 'create-location' && (
          <LocationModal
            onClose={() => setShowModal(null)}
            onSubmit={handleCreateLocation}
          />
        )}

        {showModal === 'create-config' && (
          <ConfigModal
            onClose={() => setShowModal(null)}
            onSubmit={handleCreateConfig}
          />
        )}
      </div>
    </Layout>
  );
};

// Modal Components
const UserModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    position: 'coordinator',
    department: '',
    employee_id: '',
    password: 'password123',
    confirm_password: 'password123'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
            <input
              type="tel"
              required
              value={formData.mobile_number}
              onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
            <select
              required
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="coordinator">Coordinator</option>
              <option value="validator">Validator</option>
              <option value="key-in">Key-In Operator</option>
              <option value="verification">Verification Officer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Create User
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BankModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    branch_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Bank</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
            <input
              type="text"
              value={formData.branch_name}
              onChange={(e) => setFormData({...formData, branch_name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Create Bank
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PropertyTypeModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'residential'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Property Type</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="agricultural">Agricultural</option>
              <option value="mixed">Mixed Use</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Create Type
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LocationModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    city: '',
    area: '',
    pincode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Location</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
            <input
              type="text"
              required
              value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Create Location
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConfigModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    config_type: 'general',
    key: '',
    value: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Configuration</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              required
              value={formData.config_type}
              onChange={(e) => setFormData({...formData, config_type: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General Settings</option>
              <option value="workflow">Workflow Configuration</option>
              <option value="notification">Notification Settings</option>
              <option value="security">Security Settings</option>
              <option value="integration">Integration Settings</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key *</label>
            <input
              type="text"
              required
              value={formData.key}
              onChange={(e) => setFormData({...formData, key: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
            <input
              type="text"
              required
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Create Config
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};