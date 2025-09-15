import React from 'react';
import { Phone, MessageCircle, ShoppingCart, Users, Calendar, Cog } from 'lucide-react';

const Solutions = () => {
  const solutions = [
    {
      icon: Phone,
      title: 'Speed to Lead',
      description: 'Inbound Lead Qualification and Voice Agents for 3.9x more conversion',
      points: [
        'Instant lead qualification and routing',
        'Voice agents for immediate customer engagement',
        'Proven 391% conversion rate improvement'
      ]
    },
    {
      icon: MessageCircle,
      title: 'Website Chatbots & Voice Agents',
      description: 'FAQ and customer service automation for seamless support',
      points: [
        'Intelligent FAQ handling and customer queries',
        'Voice-enabled customer service agents',
        '24/7 automated support and assistance'
      ]
    },
    {
      icon: ShoppingCart,
      title: 'eCommerce Chatbots',
      description: 'Product recommendations, upselling, and order management',
      points: [
        'Personalized product recommendation engine',
        'Order tracking and customer inquiries',
        'Increase Sales with Abandoned Cart Recovery',
      ]
    },
    {
      icon: Users,
      title: 'AI Assistants & Copilots',
      description: 'Professional virtual assistants for business operations',
      points: [
        'Virtual receptionists for call handling',
        'AI assistants for administrative tasks',
        'Professional customer interaction management'
      ]
    },
    {
      icon: Calendar,
      title: 'AI Appointment Management',
      description: 'Automated booking and appointment scheduling systems',
      points: [
        'Intelligent calendar management and booking',
        'Automated appointment setting, reminders and follow-ups',
        'Integration with existing scheduling systems'
      ]
    },
    {
      icon: Cog,
      title: 'Bespoke AI Builds',
      description: 'Custom AI solutions tailored specifically to your business needs',
      points: [
        'Industry-specific AI model development',
        'Custom integration with existing systems & workflows',
        'Scalable solutions designed for your requirements'
      ]
    }
  ];

  return (
    <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            AI Solutions
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive AI implementations across every aspect of your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const IconComponent = solution.icon;
            return (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-6 hover:border-orange-500/40 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <IconComponent className="w-8 h-8 text-orange-500 mr-3" />
                  <h3 className="text-xl font-semibold text-white">{solution.title}</h3>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.points.map((point, pointIndex) => (
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

export default Solutions;