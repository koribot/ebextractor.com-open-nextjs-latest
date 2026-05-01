import Image from "next/image";
import React from "react";
import MainLayout from "../layout/MainLayout";
import Navbar from "../components/nav-bar/Navbar";
import Footer from "../components/footer/Footer";

const AmazonApiHelpPage = () => {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Help Us Get Amazon API Approval
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your support helps us maintain our Amazon integration and provide 
              better shopping experiences for everyone.
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            {/* Instructions Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                  1
                </span>
                How You Can Help
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                When you want to purchase items on Amazon, simply click the Amazon 
                button on our site. We need <strong>3 valid purchases/sales</strong> and an 
                <strong> approved Amazon affiliate account</strong> to maintain our API approval status. 
                Your support helps us meet these requirements.
              </p>
            </div>

            {/* Image Section */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                  2
                </span>
                Visual Guide
              </h3>
              <div className="relative bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <Image
                  src="/how-to-click-amazon-button.png"
                  alt="Step-by-step guide showing how to click the Amazon button for purchases"
                  width={1000}
                  height={1000}
                  className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                  priority
                />
              </div>
            </div>

            {/* Call to Action Section */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Need More Information?
              </h3>
              <p className="text-gray-600 mb-6">
                Learn more about Amazon's Product Advertising API and registration process.
              </p>
              <a
                href="https://webservices.amazon.com/paapi5/documentation/register-for-pa-api.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <svg 
                  className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                Amazon API Documentation
                <svg 
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Additional Info Card */}
          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-medium text-blue-800 mb-2">
                  Why This Matters
                </h4>
                <p className="text-blue-700">
                  Amazon requires API partners to demonstrate consistent usage to maintain 
                  approval. Specifically, we need 3 valid purchases/sales and an approved 
                  Amazon affiliate account. Your clicks help us show that our integration 
                  provides real value to users, ensuring we can continue offering Amazon 
                  product information and links.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AmazonApiHelpPage;