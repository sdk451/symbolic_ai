import React from 'react';
import { X, Calendar, Clock, CheckCircle, Mail, Phone, Download } from 'lucide-react';

interface AppointmentConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentData: {
    appointmentId: string;
    scheduledTime: string;
    duration: number;
    confirmationCode: string;
    calendarLink: string;
  };
}

const AppointmentConfirmationPopup: React.FC<AppointmentConfirmationPopupProps> = ({
  isOpen,
  onClose,
  appointmentData
}) => {
  if (!isOpen) return null;

  const formatDateTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
  };

  const handleAddToCalendar = () => {
    // In a real implementation, this would open the calendar link
    window.open(appointmentData.calendarLink, '_blank');
  };

  const handleDownloadICS = () => {
    // In a real implementation, this would generate and download an ICS file
    alert('Calendar file download coming soon!');
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
            <h2 className="text-xl font-semibold text-white">Appointment Confirmed</h2>
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
          {/* Success Message */}
          <div className="text-center mb-6">
            <div className="p-4 rounded-full bg-green-500/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Appointment Scheduled!</h3>
            <p className="text-gray-300">
              Your appointment has been successfully scheduled. You'll receive a confirmation email shortly.
            </p>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Appointment ID</span>
              </div>
              <p className="text-white font-mono text-sm">{appointmentData.appointmentId}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Confirmation Code</span>
              </div>
              <p className="text-white font-mono text-sm">{appointmentData.confirmationCode}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-purple-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Scheduled Time</span>
              </div>
              <p className="text-white font-semibold">{formatDateTime(appointmentData.scheduledTime)}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-orange-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Duration</span>
              </div>
              <p className="text-white font-semibold">{formatDuration(appointmentData.duration)}</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">What's Next?</h4>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                  1
                </div>
                <p className="text-gray-300 flex-1">Check your email for a detailed confirmation with meeting details</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                  2
                </div>
                <p className="text-gray-300 flex-1">Add the appointment to your calendar using the link below</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                  3
                </div>
                <p className="text-gray-300 flex-1">You'll receive a reminder 24 hours before your appointment</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCalendar}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Add to Calendar
            </button>
            <button
              onClick={handleDownloadICS}
              className="flex-1 py-3 px-6 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download ICS
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Contact Information */}
          <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <h5 className="text-sm font-medium text-gray-300 mb-2">Need to make changes?</h5>
            <p className="text-sm text-gray-400">
              Contact us at <span className="text-orange-400">support@symbolicai.com</span> or call{' '}
              <span className="text-orange-400">+1 (555) 123-4567</span> with your confirmation code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmationPopup;
