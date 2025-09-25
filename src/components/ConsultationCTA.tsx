import React from 'react';
import { Calendar, ArrowRight, Star, Users, Clock } from 'lucide-react';

interface ConsultationCTAProps {
  message: string;
  personaSegment: string | null;
  onBookConsultation: () => void;
  loading?: boolean;
}

const ConsultationCTA: React.FC<ConsultationCTAProps> = ({ 
  message, 
  personaSegment, 
  onBookConsultation, 
  loading = false 
}) => {
  const getPersonaIcon = (segment: string | null) => {
    switch (segment) {
      case 'SMB':
        return <Users className="w-6 h-6" />;
      case 'SOLO':
        return <Star className="w-6 h-6" />;
      case 'EXEC':
        return <Users className="w-6 h-6" />;
      case 'FREELANCER':
        return <Star className="w-6 h-6" />;
      case 'ASPIRING':
        return <Star className="w-6 h-6" />;
      default:
        return <Calendar className="w-6 h-6" />;
    }
  };

  const getPersonaColor = (segment: string | null) => {
    switch (segment) {
      case 'SMB':
        return 'from-blue-500 to-blue-600';
      case 'SOLO':
        return 'from-green-500 to-green-600';
      case 'EXEC':
        return 'from-purple-500 to-purple-600';
      case 'FREELANCER':
        return 'from-orange-500 to-orange-600';
      case 'ASPIRING':
        return 'from-cyan-500 to-cyan-600';
      default:
        return 'from-orange-500 to-orange-600';
    }
  };

  const getPersonaBenefits = (segment: string | null) => {
    switch (segment) {
      case 'SMB':
        return [
          'Custom automation workflows',
          'Team efficiency optimization',
          'ROI-focused implementation'
        ];
      case 'SOLO':
        return [
          'Personal productivity tools',
          'Client management automation',
          'Time-saving AI solutions'
        ];
      case 'EXEC':
        return [
          'Strategic AI roadmap',
          'Executive-level insights',
          'Team-focused AI solutions', 
        ];
      case 'FREELANCER':
        return [
          'Service expansion opportunities',
          'Client delivery automation',
          'Competitive advantage tools'
        ];
      case 'ASPIRING':
        return [
          'Career development guidance',
          'AI Skill-building roadmap',
          'Industry best practices'
        ];
      default:
        return [
          'Personalized AI strategy',
          'AI implementation roadmap',
          'AI coaching and support'
        ];
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-orange-500/20 rounded-lg p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500 rounded-full translate-y-12 -translate-x-12"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${getPersonaColor(personaSegment)} mr-4`}>
            {getPersonaIcon(personaSegment)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              Ready to Get Started?
            </h3>
            <p className="text-gray-400 text-sm">
              Personalized consultation for {personaSegment || 'your'} needs
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Benefits */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-orange-400 mb-3 uppercase tracking-wide">
            What You'll Get:
          </h4>
          <ul className="space-y-2">
            {getPersonaBenefits(personaSegment).map((benefit, index) => (
              <li key={index} className="text-gray-300 flex items-center text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <button
          onClick={onBookConsultation}
          disabled={loading}
          className={`w-full bg-gradient-to-r ${getPersonaColor(personaSegment)} text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Booking...
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5 mr-2" />
              Book Free Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>

        {/* Additional Info */}
        <div className="mt-4 flex items-center justify-center text-gray-500 text-sm">
          <Clock className="w-4 h-4 mr-1" />
          <span>30-minute session • No commitment required</span>
        </div>
      </div>
    </div>
  );
};

export default ConsultationCTA;
