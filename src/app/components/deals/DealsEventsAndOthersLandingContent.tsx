"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { logger } from "@/app/utils/logger";
import { showModal } from "../common/modal/modal-provider";
import LoadingGrid from "../products-search-from-marketplaces/LoadingGrid";
import { Event, EventsResponse } from "./types";
import PreviewEventItems from "./PreviewEventItems";
import requests from "@/app/utils/http";
import { Toast } from "@/app/utils/toast";
import { api_paths } from "@/app/contants/api-paths";

const EBAY_SITE_OPTIONS = [
  { code: "EBAY_US", label: "United States" },
  { code: "EBAY_GB", label: "United Kingdom" },
  { code: "EBAY_DE", label: "Germany" },
  { code: "EBAY_AU", label: "Australia" },
  { code: "EBAY_IT", label: "Italy" },
  { code: "EBAY_CA", label: "Canada" },
  { code: "EBAY_ES", label: "Spain" },
  { code: "EBAY_FR", label: "France" },
  // { code: "EBAY_PL", label: "Poland" },
  // { code: "EBAY_NL", label: "Netherlands" },
  // { code: "EBAY_AT", label: "Austria" },
  // { code: "EBAY_CH", label: "Switzerland" },
  // { code: "EBAY_BE", label: "Belgium" },
  // { code: "EBAY_HK", label: "Hong Kong" },
  // { code: "EBAY_SG", label: "Singapore" },
  // { code: "EBAY_IE", label: "Ireland" },
] as const;

const EventCard: React.FC<{ event: Event; site: string }> = ({
  event,
  site,
}) => {
  const mainImage = event.images?.[0];
  const isExpired = new Date(event.endDate) < new Date();

  return (
    <a
      href={event.eventAffiliateWebUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white dark:bg-light-dark rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 flex flex-col h-full cursor-pointer"
    >
      {/* Image Section or Text Background */}
      <div className="relative w-full h-56 bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden flex items-center justify-center">
        {mainImage?.imageUrl ? (
          <>
            <Image
              src={mainImage.imageUrl}
              alt={mainImage.text}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
        ) : (
          <div className="text-center px-4 group-hover:scale-105 transition-transform duration-300">
            <p className="text-white font-semibold text-sm line-clamp-3">
              {event.title}
            </p>
          </div>
        )}
        {isExpired && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center ">
            <span className="text-white font-semibold text-sm">Expired</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-grow">
          {event.description}
        </p>

        {/* Coupon Badge */}
        {event.applicableCoupons &&
          event.applicableCoupons.length > 0 &&
          event.applicableCoupons[0]?.redemptionCode && (
            <div className="mb-3">
              <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded">
                {event.applicableCoupons[0].redemptionCode}
              </span>
            </div>
          )}

        {/* Terms Summary */}
        {event.terms?.summary && (
          <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-900 dark:text-amber-300 font-medium">
              {event.terms.summary}
            </p>
          </div>
        )}

        {/* Date Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          Ends{" "}
          {new Date(event.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>

        {/* CTA Button */}
        <button
          title="Preview items on Event"
          className="bg-blue-600 dark:bg-dark hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors text-center w-full"
          onClick={(e) => {
            e.preventDefault();
            showModal({
              title: `${event.title}`,
              content: <PreviewEventItems event={event} site={site} />,
            });
          }}
        >
          View Items
        </button>
      </div>
    </a>
  );
};

interface DealsEventsProps {
  data?: EventsResponse;
  site?: string;
}

const DealsEventsAndOthersLandingContent: React.FC<DealsEventsProps> = ({
  data,
  site = "EBAY_US",
}) => {
  const [events, setEvents] = React.useState<Event[]>(data?.events || []);
  const [loading, setLoading] = React.useState(!data);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState(site);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "coupons" | "discount">(
    "all"
  );

  React.useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      const response = await requests.get(
        `${api_paths.ebay_get_deals_and_events}?site=${selectedSite}`
      );
      if (response.status !== 200) {
        Toast().fire({
          icon: "error",
          title: "Error fetching deals",
          text: "Please try again later",
        });
        setLoading(false);
        setError("Failed to load deals");
        return;
      }
      const result: EventsResponse = response.requestsData;
      logger.debug.log("unfiltered events:", result);
      setHasNextPage(result.next !== undefined);
      const filteredEvents = result.events.filter(
        (e) =>
          e.title !== "Test Banner Spacing Issue" &&
          e.title !== "C2C Test NYC Static"
      );
      setEvents(filteredEvents);
      setLoading(false);
      logger.debug.log("Fetched deals:", filteredEvents);
      setError(null);
    };

    if (!data) {
      fetchDeals();
    }
  }, [selectedSite, data]);

  // Filter logic
  const filteredEvents = useMemo(() => {
    let result = events;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (filterType === "coupons") {
      result = result.filter(
        (e) =>
          e.applicableCoupons &&
          e.applicableCoupons.length > 0 &&
          e.applicableCoupons[0]?.redemptionCode
      );
    } else if (filterType === "discount") {
      result = result.filter(
        (e) => !e.applicableCoupons || e.applicableCoupons.length === 0
      );
    }

    return result;
  }, [searchQuery, filterType, events]);

  const handleReset = () => {
    setSearchQuery("");
    setFilterType("all");
  };

  const hasFilers = searchQuery || filterType !== "all";

  return (
    <main className="flex-1 overflow-auto bg-white dark:bg-dark">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-400">
            Discover the hottest deals, offers, coupons and more
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Top Row: Site Dropdown and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Site Dropdown */}
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Site
              </label>
              <select
                value={selectedSite}
                onChange={(e) => {
                  logger.debug.log(e.target.value);
                  setSelectedSite(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EBAY_SITE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <svg
                className="absolute left-3 top-10 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search deals and events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === "all"
                  ? "bg-blue-600 dark:bg-gray-500 text-white "
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterType("coupons")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === "coupons"
                  ? "bg-blue-600 text-white dark:bg-gray-500"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Coupons
            </button>
            <button
              onClick={() => setFilterType("discount")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === "discount"
                  ? "bg-blue-600 text-white "
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Discounts
            </button>

            {hasFilers && (
              <button
                onClick={handleReset}
                className="ml-auto px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          {filteredEvents.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredEvents.length} results found
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && <LoadingGrid length={12} />}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event, index) => (
              <EventCard key={index} event={event} site={selectedSite} />
            ))}
          </div>
        )}

        {/* Empty State - No Results */}
        {!loading &&
          !error &&
          filteredEvents.length === 0 &&
          events.length > 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No deals found matching your criteria
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* Empty State - No Data */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">
              No deals available at the moment
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default DealsEventsAndOthersLandingContent;
