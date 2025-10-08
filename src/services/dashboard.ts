import { PersonaSegment } from '../components/PersonaSelector';

export interface DemoCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  steps: string[];
  demoUrl: string;
  personaSegments: PersonaSegment[];
  isLocked?: boolean;
  teaserText?: string;
}

export interface ActivityItem {
  id: string;
  type: 'demo_run' | 'consultation' | 'content_view';
  title: string;
  description: string;
  timestamp: string;
  status?: 'completed' | 'in_progress' | 'failed';
}

export interface DashboardData {
  demos: DemoCard[];
  activities: ActivityItem[];
  consultationMessage: string;
  teaserContent: {
    title: string;
    description: string;
    comingSoon: boolean;
  };
}

// Demo data - in a real app, this would come from a database
export const demos: DemoCard[] = [
  {
    id: 'speed-to-lead-qualification',
    title: 'AI Lead Qualification Agent',
    description: 'Experience how our AI voice agent responds to leads and enquiries',
    icon: 'Bot',
    color: 'from-green-500 to-blue-600',
    steps: [
      'Fill out a sample lead form',
      'Talk to our virtual Sales Assistant',
      'Let the AI analyze your requirements',
      'View a summary of the lead qualification call'
    ],
    demoUrl: '#demo-lead-qualification',
    personaSegments: ['SMB', 'EXEC', 'FREELANCER']
  },
  {
    id: 'customer-service-chatbot',
    title: 'AI Customer Service Agent',
    description: 'Our customer service agent handles conversations with human-like responses',
    icon: 'MessageCircle',
    color: 'from-blue-500 to-purple-600',
    steps: [
      'Start a conversation with the AI',
      'Find available slots and book appointments',
      'Explore company knowledge base and FAQ',
      'Email escalation to the team as needed'
    ],
    demoUrl: '#demo-chatbot',
    personaSegments: ['SMB', 'EXEC', 'FREELANCER', 'SOLO']
  },
  {
    id: 'ai-appointment-scheduler',
    title: 'AI Appointment Scheduler',
    description: 'Try our AI-powered scheduling system that intelligently manages bookings',
    icon: 'Calendar',
    color: 'from-purple-500 to-red-600',
    steps: [
      'Request an appointment over the phone',
      'Hear automatic calendar suggestions',
      'AI checks and confirms availability',
      'Receive confirmation and reminders'
    ],
    demoUrl: '#demo-scheduler',
    personaSegments: ['SMB', 'EXEC', 'FREELANCER', 'SOLO']
  },
  {
    id: 'content-generator',
    title: 'AI Content Generator',
    description: 'Generate marketing content, social media posts, and blog articles with AI assistance',
    icon: 'FileText',
    color: 'from-orange-500 to-orange-600',
    steps: [
      'Select content type and topic',
      'Provide key points and tone',
      'Watch AI generate multiple options',
      'Refine and customize the output'
    ],
    demoUrl: '#demo-content-generator',
    personaSegments: ['FREELANCER', 'SOLO', 'ASPIRING'],
    isLocked: true,
    teaserText: 'Coming Soon - Advanced AI Content Creation'
  },
  {
    id: 'data-analytics',
    title: 'Business Intelligence Dashboard',
    description: 'Transform your data into actionable insights with AI-powered analytics',
    icon: 'BarChart3',
    color: 'from-cyan-500 to-cyan-600',
    steps: [
      'Connect your data sources',
      'Define key metrics and KPIs',
      'Watch AI identify patterns and trends',
      'Get automated reports and alerts'
    ],
    demoUrl: '#demo-analytics',
    personaSegments: ['EXEC', 'SMB'],
    isLocked: true,
    teaserText: 'Coming Soon - Enterprise Analytics'
  }
];

// Mock data for activities - in a real app, this would come from a database
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'demo_run',
    title: 'AI Speed to Lead Qualification Demo',
    description: 'Completed demo run - VAPI call and lead scoring finished',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'demo_run',
    title: 'Customer Service Chatbot Demo',
    description: 'Chat session completed - 8 messages exchanged',
    timestamp: '2024-01-15T09:15:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'demo_run',
    title: 'AI Appointment Scheduler Demo',
    description: 'Appointment scheduled for Jan 22, 2024 at 3:00 PM',
    timestamp: '2024-01-14T16:20:00Z',
    status: 'completed'
  },
  {
    id: '4',
    type: 'consultation',
    title: 'Consultation Request',
    description: 'Scheduled for Jan 20, 2024 at 2:00 PM',
    timestamp: '2024-01-14T15:45:00Z',
    status: 'completed'
  }
];

export const getPersonaBasedDemos = (personaSegment: PersonaSegment | null): DemoCard[] => {
  if (!personaSegment) {
    // Return all non-locked demos when no persona is specified
    return demos.filter(demo => !demo.isLocked);
  }
  
  // Get the customer service chatbot (must be 2nd demo)
  const chatbotDemo = demos.find(demo => demo.id === 'customer-service-chatbot');
  
  // Filter other demos that include the specified persona segment (excluding chatbot)
  const otherDemos = demos.filter(demo => 
    demo.id !== 'customer-service-chatbot' && 
    demo.personaSegments.includes(personaSegment) &&
    !demo.isLocked
  );
  
  // Always return exactly 3 demos with chatbot as 2nd
  const result: DemoCard[] = [];
  
  // Add first demo (or first available if none match)
  if (otherDemos.length > 0) {
    result.push(otherDemos[0]);
  } else {
    // Fallback to first available demo if no persona-specific demos
    const fallbackDemo = demos.find(demo => demo.id !== 'customer-service-chatbot' && !demo.isLocked);
    if (fallbackDemo) result.push(fallbackDemo);
  }
  
  // Add chatbot as 2nd demo (always)
  if (chatbotDemo) {
    result.push(chatbotDemo);
  }
  
  // Add third demo (or second available if only one other demo)
  if (otherDemos.length > 1) {
    result.push(otherDemos[1]);
  } else if (otherDemos.length === 1) {
    // If only one other demo, find another suitable demo
    const additionalDemo = demos.find(demo => 
      demo.id !== 'customer-service-chatbot' && 
      demo.id !== otherDemos[0].id && 
      !demo.isLocked
    );
    if (additionalDemo) result.push(additionalDemo);
  } else {
    // If no persona-specific demos, add two more available demos
    const availableDemos = demos.filter(demo => 
      demo.id !== 'customer-service-chatbot' && 
      !demo.isLocked &&
      !result.some(r => r.id === demo.id)
    );
    if (availableDemos.length > 0) result.push(availableDemos[0]);
    if (availableDemos.length > 1) result.push(availableDemos[1]);
  }
  
  return result;
};

export const getPersonaBasedConsultationMessage = (personaSegment: PersonaSegment | null): string => {
  const messages = {
    'SMB': 'Scale your business with our intelligent AI solutions.',
    'SOLO': 'Take your solo business to the next level with our AI solutions.',
    'EXEC': 'Drive your strategic transformation with our AI solutions.',
    'FREELANCER': 'Deliver more value to clients with our AI solutions.',
    'ASPIRING': 'Kickstart your career with our AI skills education.'
  };
  
  return messages[personaSegment || 'ASPIRING'];
};

export const getTeaserContent = (personaSegment: PersonaSegment | null) => {
  const teasers = {
    'SMB': {
      title: 'Advanced Workflow Automation',
      description: 'Coming soon: Multi-step business process automation with custom integrations.',
      comingSoon: true
    },
    'SOLO': {
      title: 'Personal AI Assistant',
      description: 'Coming soon: Your personal AI assistant for managing all aspects of your business.',
      comingSoon: true
    },
    'EXEC': {
      title: 'Enterprise AI Platform',
      description: 'Coming soon: Comprehensive AI platform with advanced analytics and reporting.',
      comingSoon: true
    },
    'FREELANCER': {
      title: 'Client Portal Integration',
      description: 'Coming soon: Seamless client collaboration tools with AI-powered insights.',
      comingSoon: true
    },
    'ASPIRING': {
      title: 'AI Learning Path',
      description: 'Coming soon: Structured learning modules to master AI tools and techniques.',
      comingSoon: true
    }
  };
  
  return teasers[personaSegment || 'ASPIRING'];
};

export const fetchDashboardData = async (personaSegment: PersonaSegment | null): Promise<DashboardData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    demos: getPersonaBasedDemos(personaSegment),
    activities: mockActivities,
    consultationMessage: getPersonaBasedConsultationMessage(personaSegment),
    teaserContent: getTeaserContent(personaSegment)
  };
};

export const startDemo = async (demoId: string, inputData?: Record<string, unknown>): Promise<{ success: boolean; message: string; runId?: string }> => {
  const demo = demos.find(d => d.id === demoId);
  if (!demo) {
    return { success: false, message: 'Demo not found' };
  }
  
  if (demo.isLocked) {
    return { success: false, message: 'This demo is coming soon!' };
  }
  
  try {
    // Get auth token from Supabase
    const { supabase } = await import('../lib/supabase') as { supabase: any };
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { success: false, message: 'Authentication required' };
    }
    
    // Use dedicated function for appointment scheduler, otherwise use generic API
    const apiEndpoint = demoId === 'ai-appointment-scheduler' 
      ? `/.netlify/functions/ai-appointment-scheduler-simple`
      : `/api/demos/${demoId}/run`;
    
    // Call the demo execution API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        inputData: inputData || {},
        options: {
          timeout: 120,
          priority: 'normal'
        }
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: result.message || 'Failed to start demo' 
      };
    }
    
    return { 
      success: true, 
      message: result.message || 'Demo started successfully',
      runId: result.id
    };
    
  } catch (error) {
    console.error('Demo execution error:', error);
    return { 
      success: false, 
      message: 'Failed to start demo. Please try again.' 
    };
  }
};

export const getDemoRunStatus = async (runId: string): Promise<{ 
  success: boolean; 
  data?: Record<string, unknown>; 
  message?: string 
}> => {
  try {
    const { supabase } = await import('../lib/supabase') as { supabase: any };
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { success: false, message: 'Authentication required' };
    }
    
    const response = await fetch(`/api/demos/${runId}/status`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: result.message || 'Failed to get demo status' 
      };
    }
    
    return { 
      success: true, 
      data: result
    };
    
  } catch (error) {
    console.error('Status check error:', error);
    return { 
      success: false, 
      message: 'Failed to check demo status' 
    };
  }
};
