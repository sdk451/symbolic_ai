import React from 'react';
import { X, Phone, Clock, Star, CheckCircle, Calendar, MessageSquare } from 'lucide-react';

interface CallSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  callData: {
    callId: string;
    duration: number;
    qualificationScore: number;
    summary: string;
    nextSteps: string[];
  };
}

const CallSummaryModal: React.FC<CallSummaryModalProps> = ({
  isOpen,
  onClose,
  callData
}) => {
  if (!isOpen) return null;

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'High Quality Lead';
    if (score >= 60) return 'Medium Quality Lead';
    return 'Low Quality Lead';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-500/20">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 mr-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Call Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Call Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Phone className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Call ID</span>
              </div>
              <p className="text-white font-mono text-sm">{callData.callId}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Duration</span>
              </div>
              <p className="text-white font-semibold">{formatDuration(callData.duration)}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Star className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Lead Score</span>
              </div>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${getScoreColor(callData.qualificationScore)}`}>
                  {callData.qualificationScore}
                </span>
                <span className="text-gray-400 text-sm ml-1">/100</span>
              </div>
              <p className={`text-sm ${getScoreColor(callData.qualificationScore)}`}>
                {getScoreLabel(callData.qualificationScore)}
              </p>
            </div>
          </div>

          {/* Call Summary */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <MessageSquare className="w-5 h-5 text-orange-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Call Summary</h3>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-300 leading-relaxed">{callData.summary}</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Calendar className="w-5 h-5 text-purple-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Recommended Next Steps</h3>
            </div>
            <div className="space-y-2">
              {callData.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-300 flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // TODO: Implement calendar integration
                alert('Calendar integration coming soon!');
              }}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Follow-up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallSummaryModal;
