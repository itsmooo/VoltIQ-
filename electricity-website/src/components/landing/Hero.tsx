import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-8">
              <span className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                <Zap size={16} className="mr-2" />
                Smart Energy Management
              </span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              <span className="block text-blue-600 dark:text-blue-400">PowerForecast</span>
              <span className="block mt-2">Predict Tomorrow's Energy Today</span>
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Advanced AI-powered electricity consumption forecasting for businesses and utilities.
              Make data-driven decisions and optimize your energy usage with precision.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/login"
                className="rounded-xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 transform hover:scale-105"
              >
                Get Started
                <ArrowRight size={16} className="ml-2 inline" />
              </Link>
              
              <a
                href="#features"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 flow-root sm:mt-24"
        >
          <div className="rounded-xl bg-gray-900/5 dark:bg-gray-100/5 p-2 ring-1 ring-inset ring-gray-900/10 dark:ring-gray-100/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <img
              src="https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="App screenshot"
              width={2432}
              height={1442}
              className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;