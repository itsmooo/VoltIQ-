import React from "react";
import {
  Zap,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <Zap className="h-6 w-6 text-blue-500" />
              <span className="ml-2 text-xl font-bold">PowerForecast</span>
            </div>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              Advanced AI-powered electricity consumption forecasting for
              businesses and utilities. Make data-driven decisions with
              precision.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-slate-300 hover:text-blue-400 transition-colors duration-300"
              >
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="#"
                className="text-slate-300 hover:text-blue-400 transition-colors duration-300"
              >
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="#"
                className="text-slate-300 hover:text-blue-400 transition-colors duration-300"
              >
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="#"
                className="text-slate-300 hover:text-blue-400 transition-colors duration-300"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                "Home",
                "Features",
                "Solutions",
                "Pricing",
                "About Us",
                "Contact",
                "Blog",
              ].map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Solutions</h3>
            <ul className="space-y-2">
              {[
                "Energy Forecasting",
                "Load Balancing",
                "Smart Grid Integration",
                "Renewable Energy",
                "Demand Response",
                "Utility Management",
                "Enterprise Solutions",
              ].map((item) => (
                <li key={item}>
                  <a
                    href={`/solutions/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <span className="text-slate-300 text-sm">
                  123 Energy Plaza, Suite 400
                  <br />
                  San Francisco, CA 94103
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-500 mr-2" />
                <a
                  href="tel:+14155550123"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                >
                  (415) 555-0123
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-500 mr-2" />
                <a
                  href="mailto:info@powerforecast.com"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                >
                  info@powerforecast.com
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">
                Subscribe to our newsletter
              </h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 text-sm bg-slate-800 text-white rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                />
                <button className="bg-blue-600 px-3 py-2 rounded-r-md hover:bg-blue-700 transition-colors duration-300">
                  <span className="sr-only">Subscribe</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className="text-sm text-slate-400">
              &copy; {currentYear} PowerForecast. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="/privacy-policy"
                className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-300"
              >
                Terms of Service
              </a>
              <a
                href="/cookies"
                className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-300"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
