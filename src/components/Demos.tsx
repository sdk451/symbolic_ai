import { Bot, MessageCircle, Calendar, ArrowRight, Play } from 'lucide-react';

const Demos = () => {
  const demos = [
    {
      icon: Bot,
      title: 'AI Lead Qualification Agent',
      description: 'Experience how our AI agent responds to leads and enquiries',
      steps: [
        'Fill out a sample lead form',
        'Chat with our Lead Qualification Agent on the phone',
        'Let the AI analyze your requirements',
        'View a summary of the lead qualification call'
      ],
      demoUrl: '#demo-lead-qualification',
      color: 'from-green-500 to-blue-600'
    },
    {
      icon: MessageCircle,
      title: 'Customer Service Chatbot',
      description: 'Our AI customer service agent handles inquiries with human-like responses',
      steps: [
        'Start a conversation with the AI',
        'Explore company knowledge base and FAQ',
        'Find available timeslots and book an appointment',
        'Email escalation to the team for additional support'
      ],
      demoUrl: '#demo-chatbot',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: Calendar,
      title: 'AI Appointment Scheduler',
      description: 'Try our AI-powered scheduling system that manages appointments intelligently',
      steps: [
        'Request an appointment over the phone',
        'Listen to AI check and confirm availability',
        'AI provides alternate calendar suggestions',
        'Receive confirmation and reminders'
      ],
      demoUrl: '#demo-scheduler',
      color: 'from-purple-500 to-red-600'
    }
  ];

  const handleStartDemo = (title: string) => {
    // For now, we'll just log the demo start
    console.log(`Starting demo: ${title}`);
    // In a real implementation, this would navigate to the demo or open a modal
    alert(`Demo "${title}" would start here. This is a placeholder for the actual demo functionality.`);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Try Our AI Solutions
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the power of our AI automation tools with these interactive demos. 
            See how they can transform your business operations in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {demos.map((demo, index) => {
            const IconComponent = demo.icon;
            return (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-8 hover:border-orange-500/40 transition-all duration-300 hover:transform hover:scale-105 group"
              >
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${demo.color} mr-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{demo.title}</h3>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {demo.description}
                </p>

                {/* Steps */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-orange-400 mb-3 uppercase tracking-wide">
                    Demo Steps:
                  </h4>
                  <ul className="space-y-2">
                    {demo.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-gray-300 flex items-start text-sm">
                        <span className="w-5 h-5 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                          {stepIndex + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Start Demo Button */}
                <button
                  onClick={() => handleStartDemo(demo.title)}
                  className={`w-full bg-gradient-to-r ${demo.color} text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform group-hover:scale-105 flex items-center justify-center`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Demo
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </button>

                {/* Demo Badge */}
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    Interactive Demo
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Implement These Solutions?
            </h3>
            <p className="text-gray-300 mb-6">
              Book a consultation to discuss how these AI tools can be customized for your specific business needs.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openConsultationModal'))}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25"
            >
              Book Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demos;