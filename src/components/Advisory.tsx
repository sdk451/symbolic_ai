import { Brain, UserCheck } from 'lucide-react';

const Advisory = () => {
  const advisoryServices = [
    {
      icon: Brain,
      title: 'AI Strategy Consulting',
      description: 'Partner with us to develop comprehensive AI strategies that align with your business goals and drive measurable results.',
      points: [
        'Long-term AI vision and roadmap development',
        'Technology stack recommendations and architecture',
        'Change management and organizational transformation',
        'ROI measurement and success metrics definition'
      ]
    },
    {
      icon: UserCheck,
      title: 'Fractional CTO Services',
      description: 'Get executive-level technical leadership without the full-time commitment. Our fractional CTOs guide your AI initiatives from strategy to execution.',
      points: [
        'Technical leadership and strategic oversight',
        'Team mentoring and capability development',
        'Architecture design and system integration',
        'Vendor evaluation and technology selection'
      ]
    }
  ];

  return (
    <section id="advisory" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Advisory Services
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Partner with us to implement AI and achieve massive gains through strategic consulting and executive leadership
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {advisoryServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-8 hover:border-orange-500/40 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-center mb-6">
                  <IconComponent className="w-10 h-10 text-orange-500 mr-4" />
                  <h3 className="text-2xl font-semibold text-white">{service.title}</h3>
                </div>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-3">
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

export default Advisory;