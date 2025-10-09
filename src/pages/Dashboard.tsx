import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import DemoCard from '../components/DemoCard';
import ConsultationCTA from '../components/ConsultationCTA';
import ConsultationModal from '../components/ConsultationModal';
import Footer from '../components/Footer';
import { authService } from '../services/auth';
import { User, Building2, Crown, Briefcase, GraduationCap, Zap, LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { data, loading, error, startDemoRun } = useDashboard(profile?.persona_segment || null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenConsultationModal = () => {
      setIsConsultationModalOpen(true);
    };

    window.addEventListener('openConsultationModal', handleOpenConsultationModal);
    
    return () => {
      window.removeEventListener('openConsultationModal', handleOpenConsultationModal);
    };
  }, []);

  const handleBookConsultation = () => {
    // Dispatch event to open consultation modal
    window.dispatchEvent(new CustomEvent('openConsultationModal'));
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getPersonaIcon = (segment: string | null) => {
    switch (segment) {
      case 'SMB':
        return <Building2 className="w-5 h-5" />;
      case 'SOLO':
        return <User className="w-5 h-5" />;
      case 'EXEC':
        return <Crown className="w-5 h-5" />;
      case 'FREELANCER':
        return <Briefcase className="w-5 h-5" />;
      case 'ASPIRING':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getPersonaColor = (segment: string | null) => {
    switch (segment) {
      case 'SMB':
        return 'text-yellow-400';
      case 'SOLO':
        return 'text-orange-400';
      case 'EXEC':
        return 'text-orange-500';
      case 'FREELANCER':
        return 'text-red-400';
      case 'ASPIRING':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Header */}
        <div className="border-b border-orange-500/20 bg-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-orange-500">
                  Symbolic AI Dashboard
                </h1>
              </div>
              <div className="text-sm text-gray-400">
                Loading...
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-64 bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-700 rounded-lg"></div>
                <div className="h-48 bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Header */}
        <div className="border-b border-orange-500/20 bg-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-orange-500">
                  Symbolic AI Dashboard
                </h1>
              </div>
              <div className="text-sm text-gray-400">
                Welcome, {profile?.full_name || user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-300">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-orange-500/20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-orange-500 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-300 to-orange-600 bg-clip-text text-transparent">
                Symbolic AI Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {profile?.persona_segment && (
                <div className={`flex items-center space-x-2 ${getPersonaColor(profile.persona_segment)}`}>
                  {getPersonaIcon(profile.persona_segment)}
                  <span className="text-sm font-medium">{profile.persona_segment}</span>
                </div>
              )}
              <div className="text-sm text-gray-400">
                Welcome, {profile?.full_name || user?.email}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 font-medium flex items-center"
                title="Logout"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Demo Cards Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                AI Demo Suite
              </h2>
              <p className="text-gray-400">
                Experience our core AI automation solutions
              </p>
            </div>
            
            {data?.demos && data.demos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.demos.map((demo) => (
                  <DemoCard
                    key={demo.id}
                    demo={demo}
                    onStartDemo={startDemoRun}
                    isLoading={loading}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-8 text-center">
                <p className="text-gray-400 mb-4">No demos available for your persona segment.</p>
                <button 
                  onClick={() => window.location.href = '/onboarding'}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Complete Onboarding
                </button>
              </div>
            )}
          </div>

          {/* Consultation CTA Section */}
          {data?.consultationMessage && (
            <div className="max-w-xl mx-auto">
              <ConsultationCTA
                message={data.consultationMessage}
                personaSegment={profile?.persona_segment || null}
                onBookConsultation={handleBookConsultation}
                loading={loading}
              />
            </div>
          )}

          {/* Teaser Content - Hidden for now */}
          {/* 
          {data?.teaserContent && (
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border border-orange-500/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                {data.teaserContent.title}
              </h3>
              <p className="text-gray-300 mb-4">
                {data.teaserContent.description}
              </p>
              <div className="flex items-center text-orange-400 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                Coming Soon
              </div>
            </div>
          )}
          */}
        </div>
      </div>
      
      {/* Consultation Modal */}
      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)}
        userData={{
          name: profile?.full_name || '',
          email: user?.email || '',
          phone: profile?.phone || '',
          company_name: profile?.organization_name || '',
          company_website: '',
          services_of_interest: [],
          project_timeline: '',
          estimated_budget: '',
          challenge_to_solve: '',
          company_size: '' // Honeypot field - always empty
        }}
      />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
