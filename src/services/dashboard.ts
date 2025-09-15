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

// Mock data for demos - in a real app, this would come from a database
export const mockDemos: DemoCard[] = [
  {
    id: 'lead-qualification',
    title: 'AI Lead Qualification Agent',
    description: 'Experience how our AI agent qualifies leads and schedules appointments automatically',
    icon: 'Bot',
    color: 'from-blue-500 to-blue-600',
    steps: [
      'Fill out a sample lead form',
      'Watch AI analyze and score the lead',
      'See automatic follow-up sequences',
      'View calendar integration in action'
    ],
    demoUrl: '#demo-lead-qualification',
    personaSegments: ['SMB', 'EXEC', 'FREELANCER']
  },
  {
    id: 'customer-service',
    title: 'Customer Service Chatbot',
    description: 'Test our intelligent chatbot that handles customer inquiries with human-like responses',
    icon: 'MessageCircle',
    color: 'from-green-500 to-green-600',
    steps: [
      'Start a conversation with the AI',
      'Ask common customer questions',
      'Experience natural language processing',
      'See escalation to human agents'
    ],
    demoUrl: '#demo-chatbot',
    personaSegments: ['SMB', 'EXEC', 'FREELANCER', 'SOLO']
  },
  {
    id: 'appointment-scheduler',
    title: 'Smart Appointment Scheduler',
    description: 'Try our AI-powered scheduling system that manages appointments intelligently',
    icon: 'Calendar',
    color: 'from-purple-500 to-purple-600',
    steps: [
      'Request an appointment via chat',
      'Watch AI check availability',
      'See automatic calendar blocking',
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
    title: 'AI Lead Qualification Demo',
    description: 'Completed demo run - 4/4 steps finished',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'consultation',
    title: 'Consultation Request',
    description: 'Scheduled for Jan 20, 2024 at 2:00 PM',
    timestamp: '2024-01-14T15:45:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'content_view',
    title: 'Customer Service Chatbot',
    description: 'Viewed demo details and documentation',
    timestamp: '2024-01-13T09:15:00Z',
    status: 'completed'
  }
];

export const getPersonaBasedDemos = (personaSegment: PersonaSegment | null): DemoCard[] => {
  if (!personaSegment) {
    return mockDemos.filter(demo => !demo.isLocked);
  }
  
  return mockDemos.filter(demo => 
    demo.personaSegments.includes(personaSegment)
  );
};

export const getPersonaBasedConsultationMessage = (personaSegment: PersonaSegment | null): string => {
  const messages = {
    'SMB': 'Ready to scale your business operations? Let\'s discuss how AI automation can help your growing team work more efficiently.',
    'SOLO': 'Take your solo business to the next level. Discover how AI can handle routine tasks so you can focus on what you do best.',
    'EXEC': 'Drive strategic transformation with AI. Let\'s explore enterprise-grade solutions that deliver measurable ROI.',
    'FREELANCER': 'Expand your service offerings with AI. Learn how to deliver more value to clients with intelligent automation.',
    'ASPIRING': 'Jumpstart your career with AI skills. Get personalized guidance on how to leverage AI in your professional development.'
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

export const startDemo = async (demoId: string): Promise<{ success: boolean; message: string }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const demo = mockDemos.find(d => d.id === demoId);
  if (!demo) {
    return { success: false, message: 'Demo not found' };
  }
  
  if (demo.isLocked) {
    return { success: false, message: 'This demo is coming soon!' };
  }
  
  // In a real implementation, this would start the actual demo
  console.log(`Starting demo: ${demo.title}`);
  
  return { success: true, message: `Demo "${demo.title}" started successfully!` };
};
