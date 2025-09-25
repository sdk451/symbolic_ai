import { User, Users } from 'lucide-react';

const Courses = () => {
  const courses = [
    {
      icon: User,
      title: 'AI for Individuals',
      subtitle: '10x Your Personal Productivity',
      points: [
        'Master AI tools for daily productivity',
        'Build Personal AI assistants',
        'Advance & Accelerate your Career with AI'
      ]
    },
    {
      icon: Users,
      title: 'AI for Teams',
      subtitle: 'Use AI Automation & Copilots to Smash OKRs',
      points: [
        'Team-wide AI implementation',
        'Collaborative Human / AI workflows',
        'Evaluate, Delegate & Automate'
      ]
    }
  ];

  return (
    <section id="courses" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Our Courses
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive training programs to master AI tools and strategies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {courses.map((course, index) => {
            const IconComponent = course.icon;
            return (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-8 hover:border-orange-500/40 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <IconComponent className="w-10 h-10 text-orange-500 mr-4" />
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">{course.title}</h3>
                    <p className="text-gray-300 text-lg">{course.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-3 mt-6">
                  {course.points.map((point, pointIndex) => (
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

export default Courses;