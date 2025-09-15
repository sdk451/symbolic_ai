import React from 'react';
import { Activity, Calendar, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ActivityItem } from '../services/dashboard';

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading = false }) => {
  const getActivityIcon = (type: ActivityItem['type'], status?: ActivityItem['status']) => {
    switch (type) {
      case 'demo_run':
        return status === 'completed' ? (
          <CheckCircle className="w-5 h-5 text-green-400" />
        ) : status === 'in_progress' ? (
          <Clock className="w-5 h-5 text-orange-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-400" />
        );
      case 'consultation':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'content_view':
        return <Eye className="w-5 h-5 text-purple-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type'], status?: ActivityItem['status']) => {
    switch (type) {
      case 'demo_run':
        return status === 'completed' 
          ? 'border-green-500/20 bg-green-500/5' 
          : status === 'in_progress'
          ? 'border-orange-500/20 bg-orange-500/5'
          : 'border-red-500/20 bg-red-500/5';
      case 'consultation':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'content_view':
        return 'border-purple-500/20 bg-purple-500/5';
      default:
        return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-orange-400" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-orange-400" />
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No recent activity</p>
          <p className="text-gray-500 text-sm">Start exploring demos to see your activity here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Activity className="w-6 h-6 mr-2 text-orange-400" />
        Recent Activity
      </h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`p-4 rounded-lg border ${getActivityColor(activity.type, activity.status)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type, activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white mb-1">
                  {activity.title}
                </h4>
                <p className="text-gray-300 text-sm mb-2">
                  {activity.description}
                </p>
                <p className="text-gray-500 text-xs">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <button className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors duration-200">
            View All Activity →
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
