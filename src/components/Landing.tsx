import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  Users, 
  CheckCircle, 
  MapPin, 
  Shield, 
  ArrowRight,
  Zap,
  Clock,
  Award
} from 'lucide-react';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: 'Digital File Management',
      description: 'Streamlined property file collection and management from banks with complete digital workflow.'
    },
    {
      icon: MapPin,
      title: 'On-site Validation',
      description: 'Professional validators collect photos, GPS coordinates, and property condition data.'
    },
    {
      icon: Users,
      title: 'Role-based Access',
      description: 'Secure access control with specific roles for coordinators, validators, operators, and admin.'
    },
    {
      icon: CheckCircle,
      title: 'Quality Verification',
      description: 'Multi-step verification process ensures accuracy and completeness of all property data.'
    }
  ];

  const workflow = [
    {
      step: '01',
      title: 'File Collection',
      description: 'Coordinator collects property files from banks and enters initial details',
      icon: Building2
    },
    {
      step: '02',
      title: 'Property Validation',
      description: 'Validator visits property site and collects evidence and data',
      icon: MapPin
    },
    {
      step: '03',
      title: 'Data Entry',
      description: 'Key-in operator enters detailed measurements and construction data',
      icon: FileText
    },
    {
      step: '04',
      title: 'Final Verification',
      description: 'Verification department reviews and approves files for printing',
      icon: CheckCircle
    }
  ];

  const stats = [
    { icon: Zap, value: '99.9%', label: 'Accuracy Rate' },
    { icon: Clock, value: '50%', label: 'Faster Processing' },
    { icon: Award, value: '500+', label: 'Properties Verified' },
    { icon: Shield, value: '24/7', label: 'Secure Access' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-emerald-600 p-2 rounded-xl">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  Jayarama Associates
                </span>
                <p className="text-xs text-gray-600 -mt-1">PropertyFlow System</p>
              </div>
            </div>
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional Property
              <span className="block bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Verification Services
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Jayarama Associates provides comprehensive property verification services with 
              advanced digital workflow management for banks and financial institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Access System</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Property Verification Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform handles every aspect of property verification 
              with precision, security, and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-100 to-emerald-100 p-4 rounded-xl w-fit mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Streamlined Verification Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our proven workflow ensures accuracy and efficiency at every step 
              of the property verification journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflow.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                      {item.step}
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-emerald-100 p-4 rounded-xl w-fit mx-auto mb-4">
                      <item.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
                {index < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Streamline Your Property Verification?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join banks and financial institutions who trust Jayarama Associates 
            for professional property verification services.
          </p>
          <Link
            to="/login"
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 inline-flex items-center space-x-2"
          >
            <span>Access PropertyFlow System</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-blue-600 to-emerald-600 p-2 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Jayarama Associates</span>
                <p className="text-xs text-gray-400">PropertyFlow System</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2024 Jayarama Associates. All rights reserved.</p>
              <p className="text-sm text-gray-500">Professional • Reliable • Secure</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};