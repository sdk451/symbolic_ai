import React, { useState } from 'react';
import { Building2, User, Crown, Briefcase, GraduationCap, CheckCircle, AlertCircle } from 'lucide-react';

export type PersonaSegment = 'SMB' | 'SOLO' | 'EXEC' | 'FREELANCER' | 'ASPIRING';

interface PersonaOption {
  id: PersonaSegment;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface PersonaSelectorProps {
  onSelect: (persona: PersonaSegment, organizationName?: string, organizationSize?: string) => void;
  isLoading?: boolean;
  error?: string;
}

const personaOptions: PersonaOption[] = [
  {
    id: 'SMB',
    title: 'Small/Medium Business',
    description: 'Growing business looking to adopt AI solutions to scale operations and efficiency',
    icon: <Building2 className="w-6 h-6" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'SOLO',
    title: 'Solo Entrepreneur',
    description: 'Independent professional building your own business',
    icon: <User className="w-6 h-6" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  {
    id: 'EXEC',
    title: 'Executive Leader',
    description: 'Senior leader in large organization driving strategic initiatives',
    icon: <Crown className="w-6 h-6" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'FREELANCER',
    title: 'Freelancer/Consultant',
    description: 'Independent professional providing services to multiple clients',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  {
    id: 'ASPIRING',
    title: 'Aspiring Leader',
    description: 'Professional keen to develop AI skills to advance your career',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  }
];

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ onSelect, isLoading = false, error }) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaSegment | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSize, setOrganizationSize] = useState('');

  const handlePersonaSelect = (persona: PersonaSegment) => {
    setSelectedPersona(persona);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPersona) {
      onSelect(
        selectedPersona,
        organizationName.trim() || undefined,
        organizationSize.trim() || undefined
      );
    }
  };

  const showOrganizationFields = selectedPersona && ['SMB', 'EXEC'].includes(selectedPersona);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Choose Your Persona
        </h2>
        <p className="text-gray-300 text-lg">
          Help us personalize your experience by selecting the role that best describes you
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Persona Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personaOptions.map((persona) => (
            <button
              key={persona.id}
              type="button"
              onClick={() => handlePersonaSelect(persona.id)}
              disabled={isLoading}
              className={`p-6 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
                selectedPersona === persona.id
                  ? `${persona.bgColor} ${persona.borderColor} border-2`
                  : 'bg-[#121212] border-gray-600 hover:border-gray-500'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center mb-3">
                <div className={`${persona.color} mr-3`}>
                  {persona.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {persona.title}
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                {persona.description}
              </p>
              {selectedPersona === persona.id && (
                <div className="mt-3 flex items-center text-green-400">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Organization Fields - Show for SMB and EXEC */}
        {showOrganizationFields && (
          <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Organization Details
            </h3>
            
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                id="organizationName"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Enter your organization name"
                className="w-full px-4 py-3 bg-[#121212] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
              />
            </div>

            <div>
              <label htmlFor="organizationSize" className="block text-sm font-medium text-gray-300 mb-2">
                Organization Size
              </label>
              <select
                id="organizationSize"
                value={organizationSize}
                onChange={(e) => setOrganizationSize(e.target.value)}
                className="w-full px-4 py-3 bg-[#121212] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
              >
                <option value="">Select organization size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-1000">201-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={!selectedPersona || isLoading}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mx-auto"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Completing Onboarding...
              </>
            ) : (
              'Complete Onboarding'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonaSelector;
