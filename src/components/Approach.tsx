import React from 'react';
import { Search, Zap, TrendingUp } from 'lucide-react';

const Approach = () => {
  const steps = [
    {
      icon: Search,
      title: 'Strategic AI Assessment',
      description: 'We analyze your business to identify the best AI strategy and highest impact AI opportunities',
      step: '01'
    },
    {
      icon: Zap,
      title: 'Rapid Implementation',
      description: 'We deploy AI solutions in weeks, not months, locking in revenue gains with our proven methodology',
      step: '02'
    },
    {
      icon: TrendingUp,
      title: 'Scale and Monitor',
      description: 'We partner with you to scale AI across your entire business. From sales and marketing, to service delivery and operations, to realize massive gains',
      step: '03'
    }
  ];

  return (
    <section id="approach" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Our Approach
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A proven three-step process to transform your business with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="relative bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-8 hover:border-orange-500/40 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {step.step}
                </div>
                <div className="flex items-center mb-4 mt-4">
                  <IconComponent className="w-8 h-8 text-orange-500 mr-3" />
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Approach;