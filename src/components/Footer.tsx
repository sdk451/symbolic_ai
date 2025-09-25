import { Mail, Phone, MapPin, Twitter, Linkedin, Github, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-orange-500/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <Zap className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-300 to-orange-600 bg-clip-text text-transparent">
                Symbolic AI
              </span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Transform your business with cutting-edge AI solutions
              <br />
              that deliver tangible results in weeks, not months.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div className="col-span-2 md:col-span-3">
              <h3 className="text-orange-500 font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-300">contact@symbolicenterprises.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-300">+61 4123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-300">Melbourne, VIC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sitemap */}
          <div>
            <div className="col-span-3 md:col-span-4">
              <h3 className="text-orange-500 font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-x-2">
                  {['Solutions', 'Services', 'Courses', 'Advisory', 'Approach',   ].map((link) => (
                    <a
                      key={link}
                      href={`#${link.toLowerCase()}`}
                      className="block text-gray-300 hover:text-orange-400 transition-colors duration-200"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm flex items-center">
              <Zap className="w-4 h-4 text-orange-500 mr-2" />
              © 2025 Symbolic Enterprises. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 text-sm transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;