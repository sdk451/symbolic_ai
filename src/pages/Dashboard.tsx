import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import DemoCard from '../components/DemoCard';
import ActivityFeed from '../components/ActivityFeed';
import ConsultationCTA from '../components/ConsultationCTA';
import { User, Building2, Crown, Briefcase, GraduationCap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { data, loading, error, startDemoRun } = useDashboard(profile?.persona_segment || null);

  const handleBookConsultation = () => {
    // Dispatch event to open consultation modal
    window.dispatchEvent(new CustomEvent('openConsultationModal'));
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
        return 'text-blue-400';
      case 'SOLO':
        return 'text-green-400';
      case 'EXEC':
        return 'text-purple-400';
      case 'FREELANCER':
        return 'text-orange-400';
      case 'ASPIRING':
        return 'text-cyan-400';
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
              <h1 className="text-2xl font-bold text-orange-500">
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Demo Cards */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Personalized Demos
              </h2>
              <p className="text-gray-400">
                {profile?.persona_segment 
                  ? `Demos tailored for ${profile.persona_segment} professionals`
                  : 'Explore our AI solutions'
                }
              </p>
            </div>
            
            {data?.demos && data.demos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Teaser Content */}
            {data?.teaserContent && (
              <div className="mt-8 bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border border-orange-500/20 rounded-lg p-6">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <ActivityFeed 
              activities={data?.activities || []} 
              loading={loading}
            />

            {/* Consultation CTA */}
            {data?.consultationMessage && (
              <ConsultationCTA
                message={data.consultationMessage}
                personaSegment={profile?.persona_segment || null}
                onBookConsultation={handleBookConsultation}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
