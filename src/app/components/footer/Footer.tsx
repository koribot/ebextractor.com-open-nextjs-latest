import React from "react";
import { FaDiscord, FaFacebook, FaYoutube } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className=" text-gray-600 dark:bg-light-dark dark:text-light border-t border-opacity-20 border-light-dark dark:border-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="flex flex-col items-start space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-light">
              eBextractor
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed dark:text-light">
              Your go-to tool for product search on eBay, Amazon and other
              marketplaces. All in one place.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-light">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-sm hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  title="Learn more about ebextractor - how it works, mission, how it started and more"
                  href="/about"
                  className="text-sm hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
                >
                  About ebextractor
                </a>
              </li>
              {/* <li>
                <a
                  href="https://app.ebextractor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
                >
                  Product Research
                </a>
              </li> */}
              <li>
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
                >
                  Terms and conditions
                </a>
              </li>
              <li>
                <a
                  href="/affiliate-disclosure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
                >
                  Affiliate Disclosure
                </a>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
                >
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-light">
              Contact Us
            </h3>
            <p className="text-sm dark:text-light">
              Email: support@ebextractor.com
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-light">
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <a
                role="button"
                title="eBextractor on Facebook"
                target="_blank"
                href="https://www.facebook.com/profile.php?id=61558114006843"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
              >
                {/* <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-facebook"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg> */}
                <FaFacebook className="w-6 h-6" />
              </a>
              <a
                role="button"
                title="eBextractor on YouTube"
                target="_blank"
                href="https://www.youtube.com/@eBex-tractor"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
              >
                <FaYoutube className="w-6 h-6" />
              </a>
              <a
                role="button"
                title="eBextractor on Discord"
                target="_blank"
                href="https://discord.com/invite/6W4HkVr7bD"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
              >
                <FaDiscord className="w-6 h-6" />
              </a>
              {/* <a
                href="https://www.facebook.com/profile.php?id=61558114006843"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-300 dark:hover:text-gray-50 dark:hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-twitter"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a> */}
              {/* <a
                href="#"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-instagram"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a> */}

              {/* <a
                href="#"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-300  dark:text-light dark:hover:text-gray-50 dark:hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-linkedin"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a> */}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 py-8 flex justify-center items-center">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              &copy; 2024-2026 Ebextractor. All rights reserved.
            </p>
            <a
              href="https://www.cloudflare.com/?utm_source=ebextractor.com"
              target="_blank"
              rel="noopener"
              referrerPolicy="unsafe-url"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300 dark:text-light dark:hover:text-gray-50 dark:hover:underline"
            >
              Powered By CloudFlare
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
