import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { LineChart, BarChart, Cloud, Zap, TrendingUp, Shield } from 'lucide-react';

const features = [
  {
    name: 'Advanced Forecasting',
    description: 'AI-powered predictions with up to 95% accuracy for your energy consumption patterns.',
    icon: LineChart,
  },
  {
    name: 'Real-time Analytics',
    description: 'Monitor and analyze your energy usage in real-time with detailed insights.',
    icon: BarChart,
  },
  {
    name: 'Weather Integration',
    description: 'Incorporate weather data to improve prediction accuracy and planning.',
    icon: Cloud,
  },
  {
    name: 'Smart Alerts',
    description: 'Get notified about unusual consumption patterns and potential savings.',
    icon: Zap,
  },
  {
    name: 'Trend Analysis',
    description: 'Identify long-term patterns and optimize your energy strategy.',
    icon: TrendingUp,
  },
  {
    name: 'Secure Platform',
    description: 'Enterprise-grade security to protect your sensitive energy data.',
    icon: Shield,
  },
];

const Features: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div id="features" className="py-24 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">
            Powerful Features
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to manage energy consumption
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Our comprehensive suite of tools helps you understand, predict, and optimize your electricity usage
            with unprecedented accuracy.
          </p>
        </div>
        
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <feature.icon
                    className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;