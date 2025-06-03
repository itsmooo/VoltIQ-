import React, { useState, useEffect } from "react";
import { Menu, X, Zap } from "lucide-react";
import { Link } from "../ui/Link";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-blue-500">
                <Zap className="h-8 w-8" />
              </span>
              <span
                className={`ml-2 text-xl font-bold transition-colors duration-300 ${
                  scrolled ? "text-slate-900" : "text-white"
                }`}
              >
                PowerForecast
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {["Home", "Features", "Solutions", "Pricing", "About Us"].map(
              (item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    scrolled
                      ? "text-slate-700 hover:text-blue-600"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {item}
                </Link>
              )
            )}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <a
              href="/get-started"
              className="ml-8 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-md transition-colors duration-300 ${
                scrolled
                  ? "text-slate-800 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`md:hidden ${
          isOpen ? "block" : "hidden"
        } bg-white shadow-lg`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {["Home", "Features", "Solutions", "Pricing", "About Us"].map(
            (item) => (
              <a
                key={item}
                href={`/${item.toLowerCase().replace(" ", "-")}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-gray-50"
              >
                {item}
              </a>
            )
          )}
          <a
            href="/get-started"
            className="block w-full text-center mt-4 px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
