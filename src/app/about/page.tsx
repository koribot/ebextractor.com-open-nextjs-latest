import React from "react";
import MainLayout from "../layout/MainLayout";

const AboutPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-brpy-12 p-4 dark:bg-light-gray">
        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 dark:bg-light-dark">
            <h2 className="text-sm md:text-4xl font-bold text-black dark:text-light mb-6">
              Why eBextractor Exists
            </h2>

            <p className="text-xs md:text-lg text-gray-700 mb-6 dark:text-light">
              eBextractor’s main goal is to provide an all-in-one marketplace
              search experience. You no longer need to visit each website
              individually — eBextractor brings multiple platforms together in
              one place. It’s designed to deliver valuable insights for
              resellers, highlight the best deals, and help avid buyers discover
              great products with ease.
            </p>

            <p className="text-xs md:text-lg text-gray-700 mb-6 dark:text-light">
              I started working with eBay sellers back in 2020 to date, managing
              listings and helping on a daily basis. Every day, I was manually
              searching through thousands of products, trying to find pricing
              patterns and identify opportunities. The process was slow,
              tedious, and inefficient.
            </p>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 my-8">
              <p className="text-xs md:text-lg text-gray-800 dark:text-light font-semibold mb-2">
                The Core Problem:
              </p>
              <p className="text-xs md:text-lg text-gray-700 dark:text-light">
                There was no tool that could quickly compare prices across
                multiple marketplaces and help sellers find the best deals. So I
                made an extension to show the highest, lowest, and average
                prices directly on eBay search pages. Now, I realize I can make
                a website out of it and add more features, functionality and
                integrate more marketplaces, and that's where eBextractor was
                born.
              </p>
            </div>

            {/* What eBextractor Does */}
            <h3 className="text-sm md:text-3xl text-black dark:text-light font-bold mt-12 mb-6">
              What eBextractor Does
            </h3>

            <p className="text-xs md:text-lg text-black dark:text-light mb-8">
              eBextractor is a suite of tools designed to make product
              search/research faster, smarter, and more profitable. Whether
              you're comparing prices, analyzing keywords, discovering trending
              products, or you just want to buy something at the best price,
              eBextractor gives you the data you need in seconds.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                <h4 className="text-xs md:text-xl font-bold mb-3">
                  🔍 Multi-Marketplace Search
                </h4>
                <p className="dark:text-light">
                  Search eBay, Amazon, AliExpress, and more simultaneously.
                  Compare prices across platforms in real-time.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                <h4 className="text-xs md:text-xl font-bold mb-3">
                  📊 Advanced Analytics
                </h4>
                <p className="dark:text-light">
                  Get detailed breakdowns including highest price, lowest price,
                  average price, keyword frequency, and seller insights.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                <h4 className="text-xs md:text-xl font-bold mb-3">
                  🖼️ Image Search
                </h4>
                <p className="dark:text-light">
                  Upload any product image and find similar items across eBay.
                  Perfect for identifying products and discovering sources.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                <h4 className="text-xs md:text-xl font-bold mb-3">
                  📈 Price Tracking
                </h4>
                <p className="dark:text-light">
                  Monitor price trends, get notifications on price drops, and
                  stay competitive with real-time market data.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                <h4 className="text-xs md:text-xl font-bold mb-3">
                  🎯 Keyword Research
                </h4>
                <p className="dark:text-light">
                  Track keyword occurrence across listings to optimize your own
                  product titles and descriptions for better visibility.
                </p>
              </div>
            </div>

            {/* Platform Evolution */}
            <h3 className="text-sm md:text-3xl font-bold dark:text-light  mt-12 mb-6">
              The Platform Evolution
            </h3>

            <p className="text-xs md:text-lg dark:text-light mb-4">
              <strong className="dark:text-light">ebextractor.com</strong>{" "}
              serves as the universal search engine—search multiple marketplaces
              at once and compare prices across platforms. It's built with
              Next.js and integrates with eBay's official API to deliver
              accurate, real-time results.
            </p>

            <p className="text-xs md:text-lg dark:text-light mb-4">
              <strong className="dark:text-light">
                eBextractor Chrome Extension
              </strong>{" "}
              brings the power of analytics directly into your browser. Analyze
              any eBay search page on the fly without leaving the site.
            </p>

            {/* Tech Stack */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 my-8">
              <h3 className="text-sm md:text-2xl font-bold mb-4">
                Built With Modern Tech
              </h3>
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="dark:light-dark px-4 py-2 rounded-full text-sm font-medium">
                  Next.js
                </span>
                <span className="dark:light-dark px-4 py-2 rounded-full text-sm font-medium">
                  React
                </span>
                <span className="dark:light-dark px-4 py-2 rounded-full text-sm font-medium">
                  TypeScript
                </span>
                <span className="dark:light-dark px-4 py-2 rounded-full text-sm font-medium">
                  Cloudflare D1
                </span>
                <span className="dark:light-dark px-4 py-2 rounded-full text-sm font-medium">
                  Tailwind CSS
                </span>
                <span className="dark:light-dark px-4 py-2 rounded-full text-sm font-medium">
                  eBay API
                </span>
                <span className="dark:light-dark px-4 py-2 rounded-full text-sm font-medium">
                  Python/Flask
                </span>
              </div>
              <p className="dark:light-dark">
                Deployed on Cloudflare's global edge network for fast, reliable
                performance worldwide.
              </p>
              <a
                href="https://opennext.js.org/cloudflare?utm_source=ebextractor.com"
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                Cloudflare - OpenNextjs
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 justify-center">
              <div className="bg-white dark:bg-gray-800 border-2 border-purple-600 dark:border-gray-600 rounded-xl p-6 text-center">
                <span className="block text-sm md:text-5xl font-bold text-purple-600 mb-2">
                  Multiple
                </span>
                <span className="dark:text-light text-sm">
                  Marketplaces supported and more coming
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 border-2 border-purple-600 dark:border-gray-600 rounded-xl p-6 text-center">
                <span className="block text-sm md:text-5xl font-bold text-purple-600 mb-2">
                  Price alert
                </span>
                <span className="dark:text-light text-sm">
                  notifications Stay informed about price changes across
                  platforms - COMMING SOON
                </span>
              </div>
            </div>

            {/* Who It's For */}
            <h3 className="text-sm md:text-3xl font-bold dark:text-light mt-12 mb-6">
              Who It's For
            </h3>

            <p className="text-xs md:text-lg dark:text-light mb-4">
              eBextractor is built for anyone who needs to make data-driven
              decisions about products:
            </p>

            <ul className="space-y-3 dark:text-light ml-6 mb-8">
              <li className="text-sm md:text-lg">
                <strong className="dark:text-light">
                  eBay & Amazon Sellers:
                </strong>{" "}
                Research profitable products, analyze competition, optimize
                listings
              </li>
              <li className="text-sm md:text-lg">
                <strong className="dark:text-light">
                  Resellers & Arbitrage:
                </strong>{" "}
                Find price discrepancies across platforms, discover sourcing
                opportunities
              </li>
              <li className="text-sm md:text-lg">
                <strong className="dark:text-light">Wholesalers:</strong>{" "}
                Compare supplier prices, identify trending products, track
                market demand
              </li>
              <li className="text-sm md:text-lg">
                <strong className="dark:text-light">Shoppers:</strong> Find the
                best deals, compare prices across multiple sites, discover
                similar products
              </li>
            </ul>

            {/* Continuous Improvement */}
            <h3 className="text-sm md:text-3xl dark:text-light font-bold mt-12 mb-6">
              Continuous Improvement
            </h3>

            <p className="text-xs md:text-lg dark:text-light mb-4">
              eBextractor isn't a finished product—it's constantly evolving. I'm
              regularly adding new features, expanding marketplace support, and
              improving analytics based on what sellers actually need. The tools
              are built by someone who understands the challenges because I work
              with sellers every day.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <a
                href="https://www.ebextractor.com/search"
                className="bg-blue-600 text-white dark:bg-gray-800 dark:text-light px-10 py-4 rounded-full text-lg font-semibold text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
              >
                Start Searching
              </a>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center dark:text-light mt-8">
            <p className="text-sm md:text-lg mb-3">
              Questions or feedback? Reach out anytime
            </p>
            <p className="text-sm md:text-lg">
              <a
                href="mailto:support@ebextractor.com"
                className="border-b-2 border-white hover:opacity-80 transition-opacity"
              >
                support@ebextractor.com
              </a>
              <span className="mx-3">•</span>
              <a
                href="https://github.com/koribot"
                target="_blank"
                rel="noopener noreferrer"
                className="border-b-2 border-white hover:opacity-80 transition-opacity"
              >
                GitHub
              </a>
            </p>
            <p className="text-sm md:text-lg mt-3">
                You can also contact me for drafting, listing works on ebay
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
