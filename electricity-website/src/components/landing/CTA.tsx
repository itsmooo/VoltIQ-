import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';

const CTA: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="relative isolate overflow-hidden bg-gray-900">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to optimize your energy usage?
            <br />
            Start using PowerForecast today.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Join thousands of businesses already using PowerForecast to predict and optimize their electricity consumption.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/login"
              className="rounded-xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              Get started
              <ArrowRight size={16} className="ml-2 inline" />
            </Link>
            <a
              href="#features"
              className="text-sm font-semibold leading-6 text-white hover:text-blue-400 transition-colors duration-200"
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </motion.div>
      </div>
      <svg
        viewBox="0 0 1024 1024"
        className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
        aria-hidden="true"
      >
        <circle
          cx={512}
          cy={512}
          r={512}
          fill="url(#gradient)"
          fillOpacity="0.7"
        />
        <defs>
          <radialGradient id="gradient">
            <stop stopColor="#3B82F6" />
            <stop offset={1} stopColor="#1D4ED8" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default CTA;