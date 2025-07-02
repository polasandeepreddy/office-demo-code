import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CoordinatorDashboard } from './dashboards/CoordinatorDashboard';
import { ValidatorDashboard } from './dashboards/ValidatorDashboard';
import { KeyInDashboard } from './dashboards/KeyInDashboard';
import { VerificationDashboard } from './dashboards/VerificationDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.position) {
    case 'coordinator':
      return <CoordinatorDashboard />;
    case 'validator':
      return <ValidatorDashboard />;
    case 'key-in':
      return <KeyInDashboard />;
    case 'verification':
      return <VerificationDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div>Unknown role</div>;
  }
};