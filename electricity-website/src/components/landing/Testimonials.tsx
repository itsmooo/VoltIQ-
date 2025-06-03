import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star } from 'lucide-react';

const testimonials = [
  {
    content: "PowerForecast has transformed how we manage our energy consumption. The predictions are incredibly accurate.",
    author: "Sarah Chen",
    role: "Energy Manager",
    company: "Tech Solutions Inc.",
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150"
  },
  {
    content: "The insights we've gained have helped us reduce our energy costs by 30%. Highly recommended!",
    author: "Michael Rodriguez",
    role: "Facility Director",
    company: "Global Manufacturing",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
  },
  {
    content: "The best energy forecasting solution we've used. The weather integration is particularly impressive.",
    author: "Emma Thompson",
    role: "Sustainability Lead",
    company: "EcoSmart Buildings",
    image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150"
  }
];

const Testimonials: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="py-24 bg-gray-50 dark:bg-gray-800 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-blue-600 dark:text-blue-400">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Trusted by Industry Leaders
          </p>
        </div>
        
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative bg-white dark:bg-gray-900 px-6 py-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-center gap-x-4 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <blockquote className="text-lg font-semibold leading-8 text-gray-900 dark:text-white">
                  "{testimonial.content}"
                </blockquote>
                <div className="mt-6 flex items-center gap-x-4">
                  <img
                    className="h-12 w-12 rounded-full bg-gray-50"
                    src={testimonial.image}
                    alt={testimonial.author}
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Testimonials;