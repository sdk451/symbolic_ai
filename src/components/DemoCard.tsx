import React from 'react';
import { Play, Lock, ArrowRight, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { DemoCard as DemoCardType } from '../services/dashboard';
import { useDemoExecution } from '../hooks/useDemoExecution';

interface DemoCardProps {
  demo: DemoCardType;
  onStartDemo?: (demoId: string) => Promise<{ success: boolean; message: string }>;
  isLoading?: boolean;
}

const DemoCard: React.FC<DemoCardProps> = ({ demo, onStartDemo, isLoading = false }) => {
  const { 
    status, 
    isLoading: isExecuting, 
    error, 
    startDemo
  } = useDemoExecution();
  
  const [isStartingDemo, setIsStartingDemo] = React.useState(false);

  const handleStartDemo = async () => {
    if (demo.isLocked || isExecuting) return;
    
    try {
      const result = await startDemo(demo.id);
      if (result.success) {
        // Success message will be shown via status updates
        console.log('Demo started:', result.message);
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Failed to start demo. Please try again.');
    }
  };

  // Use the hook's startDemo if no onStartDemo prop is provided
  const handleDemoStart = onStartDemo ? 
    async () => {
      if (demo.isLocked || isStartingDemo) return;
      
      setIsStartingDemo(true);
      try {
        const result = await onStartDemo(demo.id);
        if (result.success) {
          alert(result.message);
        } else {
          alert(result.message);
        }
      } catch (err) {
        alert('Failed to start demo. Please try again.');
      } finally {
        setIsStartingDemo(false);
      }
    } : 
    handleStartDemo;

  const getIconComponent = (iconName: string) => {
    // For now, return a simple div with the icon name
    // In a real implementation, you'd import the actual icons
    return <div className="w-8 h-8 text-white flex items-center justify-center bg-gray-600 rounded">{iconName}</div>;
  };

  return (
    <div className={`bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-6 transition-all duration-300 hover:transform hover:scale-105 group ${
      demo.isLocked ? 'opacity-75' : 'hover:border-orange-500/40'
    }`}>
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${demo.color} mr-4`}>
          {getIconComponent(demo.icon)}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">{demo.title}</h3>
          {demo.isLocked && (
            <div className="flex items-center text-orange-400 text-sm">
              <Lock className="w-4 h-4 mr-1" />
              <span>Coming Soon</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-4 leading-relaxed">
        {demo.description}
      </p>

      {/* Steps */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-orange-400 mb-3 uppercase tracking-wide">
          Demo Steps:
        </h4>
        <ul className="space-y-2">
          {demo.steps.map((step, index) => (
            <li key={index} className="text-gray-300 flex items-start text-sm">
              <span className="w-5 h-5 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      {/* Teaser Text for Locked Demos */}
      {demo.isLocked && demo.teaserText && (
        <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <p className="text-orange-400 text-sm font-medium">{demo.teaserText}</p>
        </div>
      )}

      {/* Demo Status Display */}
      {status && status.demoId === demo.id && (
        <div className="mb-4 p-3 rounded-lg border">
          {status.status === 'queued' && (
            <div className="flex items-center text-blue-400">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="text-sm">Demo queued for execution...</span>
            </div>
          )}
          {status.status === 'running' && (
            <div className="flex items-center text-yellow-400">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="text-sm">Demo is running...</span>
            </div>
          )}
          {status.status === 'succeeded' && (
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">Demo completed successfully!</span>
            </div>
          )}
          {status.status === 'failed' && (
            <div className="flex items-center text-red-400">
              <XCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">Demo failed: {status.errorMessage || 'Unknown error'}</span>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleDemoStart}
        disabled={demo.isLocked || isExecuting || isStartingDemo || isLoading}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
          demo.isLocked
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : `bg-gradient-to-r ${demo.color} text-white hover:shadow-lg transform group-hover:scale-105`
        } ${(isExecuting || isStartingDemo) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {(isExecuting || isStartingDemo) ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Starting...
          </>
        ) : demo.isLocked ? (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Coming Soon
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Start Demo
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </>
        )}
      </button>

      {/* Demo Badge */}
      <div className="mt-4 text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
          demo.isLocked
            ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        }`}>
          {demo.isLocked ? (
            <>
              <Clock className="w-3 h-3 mr-1" />
              Coming Soon
            </>
          ) : (
            'Interactive Demo'
          )}
        </span>
      </div>
    </div>
  );
};

export default DemoCard;
