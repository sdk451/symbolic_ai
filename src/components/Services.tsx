import React from 'react';
import { Bot, Workflow, Search, Users, Target, Code } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Bot,
      title: 'AI Agents & Assistants',
      points: [
        'Automated lead conversion systems',
        'AI chatbots for customer service',
        'AI assistants for sales and instant quotes',
      ]
    },
    {
      icon: Workflow,
      title: 'AI Automations & Workflows',
      points: [
        'AI for service delivery & ops',
        'Optimise or automate processes with AI',
        'Bespoke AI & automation solutions'
      ]
    },
    {
      icon: Search,
      title: 'AI Opportunity Audit',
      points: [
        'Identify high-impact AI use cases',
        'ROI analysis and prioritization',
        'Rapid implementation and gains'
      ]
    },
    {
      icon: Users,
      title: 'AI Courses & Coaching',
      points: [
        'Personalized Ai Coaching & Mentoring',
        'AI for Individual Productivity',
        'AI for Teams & Transformation'
      ]
    },
    {
      icon: Target,
      title: 'AI Strategy & Advisory',
      points: [
        'Long-term AI strategic vision',
        'AI Automation & Digital Workforce',
        'AI implementation and guidance'
      ]
    },
    {
      icon: Code,
      title: 'Fractional CTO',
      points: [
        'Business transformation for 10x results',
        'AI leadership and oversight',
        'Tech implementation, team mentoring and guidance'
      ]
    }
  ];

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive AI solutions to transform your business and drive growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-6 hover:border-orange-500/40 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <IconComponent className="w-8 h-8 text-orange-500 mr-3" />
                  <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                </div>
                <ul className="space-y-2">
                  {service.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="text-gray-300 flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;