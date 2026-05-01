"use client";

import { Item } from "@/app/ebay/types";
import React from "react";
import { differenceInDays } from "date-fns";
import { showModal } from "@/app/components/common/modal/modal-provider";
import { FaInfo } from "react-icons/fa6";

interface Props {
  itemData: Item;
}

function TitleLengthInfo() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-blue-500 rounded-lg p-2 mt-0.5">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            About Title Length
          </h3>
          <p className="text-sm text-gray-600">
            Title length refers to the number of characters in your eBay listing
            title, including spaces.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-3 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium text-gray-900">Best Practice</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          eBay titles with{" "}
          <strong className="text-gray-900">60+ characters</strong> tend to
          perform better in search results as they can include more relevant
          keywords.
        </p>
      </div>

      <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-200">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-900 mb-1">Quick Tip</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              eBay allows titles up to <strong>80 characters</strong>. Consider
              adding more descriptive keywords to improve searchability.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <span>Optimize your titles for better visibility</span>
      </div>
    </div>
  );
}

function ScarcityChart({ itemData }: Props) {
  // Calculate metrics
  const calculateMetrics = () => {
    const availability = itemData?.estimatedAvailabilities?.[0];
    if (!availability) return null;

    const sold = availability.estimatedSoldQuantity || 0;
    const remaining = availability.estimatedRemainingQuantity || 0;
    const totalStock = sold + remaining;

    const listingDate = itemData.itemCreationDate
      ? new Date(itemData.itemCreationDate)
      : null;
    const daysListed = listingDate
      ? differenceInDays(new Date(), listingDate)
      : 0;

    // Prevent division by zero
    const safeDaysListed = daysListed > 0 ? daysListed : 1;

    const soldPerDay = sold / safeDaysListed;
    const stockPercentage = totalStock > 0 ? (remaining / totalStock) * 100 : 0;
    const velocityScore = soldPerDay * 10; // Scale for visualization

    // Scarcity score: higher when stock is low and velocity is high
    const scarcityScore = Math.min(
      100,
      (100 - stockPercentage) * 0.6 + Math.min(velocityScore * 10, 100) * 0.4,
    );

    // Days until sold out (if continuing at current pace)
    const daysUntilSoldOut =
      soldPerDay > 0 ? Math.ceil(remaining / soldPerDay) : Infinity;

    return {
      sold,
      remaining,
      totalStock,
      daysListed,
      soldPerDay,
      stockPercentage,
      scarcityScore,
      daysUntilSoldOut,
      velocityScore: Math.min(velocityScore * 10, 100),
    };
  };

  const metrics = calculateMetrics();

  if (!metrics || metrics.totalStock === 0) {
    return null;
  }

  const getScarcityColor = (score: number) => {
    if (score >= 70) return "from-red-500 to-orange-500";
    if (score >= 40) return "from-yellow-500 to-amber-500";
    return "from-green-500 to-emerald-500";
  };

  const getScarcityLabel = (score: number) => {
    if (score >= 70) return "High Demand";
    if (score >= 40) return "Moderate";
    return "Low Demand";
  };

  // Function to show info modal
  const showInfoModal = () => {
    showModal({
      title: "📊 Demand Metrics Explained",
      content: (
        <div className="space-y-4 text-sm">
          {/* Important Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              ⚠️ Important: These Are Estimates Only
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-xs">
              All metrics shown are estimations based on available eBay data.
              Actual demand and sales velocity may vary.
            </p>
          </div>

          {/* Score Section */}
          <div className="border-l-4 border-blue-500 pl-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
              🎯 eBextractor Score ({metrics.scarcityScore.toFixed(0)}/100)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              This is our proprietary demand indicator that combines multiple
              factors:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 text-xs ml-2">
              <li>60% based on remaining stock percentage</li>
              <li>40% based on sales velocity</li>
              <li>
                <strong>70-100:</strong> High Demand - Item selling quickly with
                limited stock
              </li>
              <li>
                <strong>40-69:</strong> Moderate - Steady sales activity
              </li>
              <li>
                <strong>0-39:</strong> Low Demand - Plenty of stock available
              </li>
            </ul>
          </div>

          {/* Velocity Section */}
          <div className="border-l-4 border-cyan-500 pl-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
              ⚡ Velocity ({metrics.soldPerDay.toFixed(1)} units/day)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Average units sold per day, calculated as:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs font-mono mb-2">
              Total Sold ({metrics.sold}) ÷ Days Listed ({metrics.daysListed}) ={" "}
              {metrics.soldPerDay.toFixed(2)}/day
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              <strong>Note:</strong> This assumes sales were evenly distributed
              over time, which may not reflect reality. Sales often spike during
              promotions, holidays, or when first listed.
            </p>
          </div>

          {/* Stock Distribution */}
          <div className="border-l-4 border-green-500 pl-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
              📦 Stock Distribution
            </h3>
            <div className="space-y-1 text-xs">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Total Stock:</span>{" "}
                {metrics.totalStock} units
              </p>
              <p className="text-blue-600 dark:text-blue-400">
                <span className="font-semibold">Sold:</span> {metrics.sold}{" "}
                units ({((metrics.sold / metrics.totalStock) * 100).toFixed(1)}
                %)
              </p>
              <p className="text-green-600 dark:text-green-400">
                <span className="font-semibold">Remaining:</span>{" "}
                {metrics.remaining} units ({metrics.stockPercentage.toFixed(1)}
                %)
              </p>
            </div>
          </div>

          {/* Sales Projection */}
          <div className="border-l-4 border-purple-500 pl-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
              📈 7-Day Sales Projection
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2 text-xs">
              This forecast projects future sales based on the current velocity.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 text-xs">
              <p className="font-semibold text-red-800 dark:text-red-200 mb-1">
                ⚠️ Major Limitations:
              </p>
              <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                <li>
                  We don't know <strong>when</strong> specific sales occurred
                </li>
                <li>Sales velocity likely changed over time</li>
                <li>Items listed long ago may have poor recent performance</li>
                <li>Recent listings may show artificially high velocity</li>
                <li>Seasonal trends and promotions aren't accounted for</li>
              </ul>
            </div>
            {metrics.daysUntilSoldOut !== Infinity && (
              <p className="text-purple-600 dark:text-purple-400 text-xs mt-2">
                <strong>Estimated sellout:</strong> ~{metrics.daysUntilSoldOut}{" "}
                days (if current pace continues)
              </p>
            )}
          </div>

          {/* Item Age Context */}
          <div className="border-l-4 border-orange-500 pl-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
              ⏱️ Listing Age Context
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
              This item has been listed for{" "}
              <strong>{metrics.daysListed} days</strong>.
            </p>
            {metrics.daysListed > 30 ? (
              <p className="text-orange-600 dark:text-orange-400 text-xs">
                ⚠️ Older listings may have experienced changing demand over
                time. Recent sales activity may differ significantly from the
                overall average.
              </p>
            ) : (
              <p className="text-green-600 dark:text-green-400 text-xs">
                ✓ This is a relatively new listing, so the metrics likely
                reflect current market conditions.
              </p>
            )}
          </div>

          {/* Bottom disclaimer */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-xs text-center">
            <p className="text-gray-600 dark:text-gray-400">
              These metrics are provided for informational purposes only. Always
              do your own research before making purchasing decisions.
            </p>
          </div>
        </div>
      ),
    });
  };

  // Calculate SVG path for radial progress
  const getRadialPath = (
    percentage: number,
    radius: number = 45,
    strokeWidth: number = 8,
  ) => {
    const angle = (percentage / 100) * 180; // Semi-circle (0 to 180 degrees)
    const startAngle = 180;
    const endAngle = startAngle - angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 50 + radius * Math.cos(startRad);
    const y1 = 50 + radius * Math.sin(startRad);
    const x2 = 50 + radius * Math.cos(endRad);
    const y2 = 50 + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2}`;
  };

  // Projection data for the area chart
  const projectionData = Array.from({ length: 8 }, (_, i) => {
    const day = i;
    const projectedSold = Math.min(
      metrics.sold + metrics.soldPerDay * day,
      metrics.totalStock,
    );
    const projectedRemaining = Math.max(metrics.totalStock - projectedSold, 0);

    return {
      day: i === 0 ? "Now" : `+${i}d`,
      sold: projectedSold,
      remaining: projectedRemaining,
      soldPercentage: (projectedSold / metrics.totalStock) * 100,
      remainingPercentage: (projectedRemaining / metrics.totalStock) * 100,
    };
  });

  const soldPercentage = (metrics.sold / metrics.totalStock) * 100;
  const remainingPercentage = (metrics.remaining / metrics.totalStock) * 100;

  return (
    <div
      className="
      bg-white dark:bg-slate-800 rounded-lg border border-gray-200 mx-auto
      dark:border-slate-700 overflow-hidden shadow-sm w-full max-w-xs h-fit"
    >
      {/* Header with Info Button */}
      <div
        className="
        bg-gray-50 dark:bg-slate-800/50 px-3 py-2 border-b
        border-gray-200 dark:border-slate-700 flex items-center justify-between"
      >
        <h3 className="text-gray-700 dark:text-gray-200 font-semibold text-xs tracking-wide flex items-center gap-1.5">
          {/*<FaInfoCircle className="text-blue-500" />*/}
          DEMAND METRICS (Estimation){" "}
        </h3>
        <button
          onClick={showInfoModal}
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
          title="Learn more about these metrics"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
      <div className="p-3 space-y-3">
        {/* Radial Charts Row - Smaller */}
        <div className="grid grid-cols-2 gap-2">
          {/* Scarcity Score Radial */}
          <div
            // title={`eBextractor Demand Score: ${metrics.scarcityScore.toFixed(0)}/100 - Combines stock availability (60%) and sales velocity (40%) to estimate demand. Higher scores indicate items selling faster with limited stock remaining.`}
            className="bg-gray-50/50 dark:bg-slate-700/20 rounded-md p-2 border border-gray-200 dark:border-slate-600/50"
          >
            <div className="text-gray-500 dark:text-slate-400 text-[10px] font-medium mb-1 text-center">
              Score
            </div>
            <div className="relative w-full aspect-square max-w-[80px] mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background arc */}
                <path
                  d={getRadialPath(100)}
                  fill="none"
                  stroke="#e5e7eb"
                  className="dark:stroke-slate-600"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                  d={getRadialPath(metrics.scarcityScore)}
                  fill="none"
                  stroke={
                    metrics.scarcityScore >= 70
                      ? "#f87171"
                      : metrics.scarcityScore >= 40
                        ? "#fbbf24"
                        : "#34d399"
                  }
                  strokeWidth="10"
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                {/* Center text */}
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xl font-bold fill-gray-700 dark:fill-gray-200"
                  style={{ fontSize: "18px" }}
                >
                  {metrics.scarcityScore.toFixed(0)}
                </text>
              </svg>
            </div>
            <div className="text-center mt-0.5">
              <span
                className={`text-[9px] font-semibold ${
                  metrics.scarcityScore >= 70
                    ? "text-red-500 dark:text-red-400"
                    : metrics.scarcityScore >= 40
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-green-500 dark:text-green-400"
                }`}
              >
                {getScarcityLabel(metrics.scarcityScore)}
              </span>
            </div>
          </div>

          {/* Velocity Radial */}
          <div
            // title={`Sales Velocity: ${metrics.soldPerDay.toFixed(1)} units/day - Average number of items sold per day (${metrics.sold} sold ÷ ${metrics.daysListed} days listed). Note: This assumes even distribution over time, but actual sales patterns may vary significantly.`}
            className="bg-gray-50/50 dark:bg-slate-700/20 rounded-md p-2 border border-gray-200 dark:border-slate-600/50"
          >
            <div className="text-gray-500 dark:text-slate-400 text-[10px] font-medium mb-1 text-center">
              Velocity
            </div>
            <div className="relative w-full aspect-square max-w-[80px] mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background arc */}
                <path
                  d={getRadialPath(100)}
                  fill="none"
                  stroke="#e5e7eb"
                  className="dark:stroke-slate-600"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                  d={getRadialPath(metrics.velocityScore)}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                {/* Center text */}
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-bold fill-cyan-600 dark:fill-cyan-400"
                  style={{ fontSize: "14px" }}
                >
                  {metrics.soldPerDay.toFixed(1)}
                </text>
              </svg>
            </div>
            <div className="text-center mt-0.5">
              <span className="text-[9px] font-semibold text-cyan-600 dark:text-cyan-400">
                /day
              </span>
            </div>
          </div>
        </div>

        {/* Stock Distribution - Compact Donut */}
        <div
          // title={`Stock Distribution: ${metrics.sold} units sold (${((metrics.sold / metrics.totalStock) * 100).toFixed(1)}%) and ${metrics.remaining} units remaining (${metrics.stockPercentage.toFixed(1)}%) out of ${metrics.totalStock} total units available since listing.`}
          className="bg-gray-50/50 dark:bg-slate-700/20 rounded-md p-2 border border-gray-200 dark:border-slate-600/50"
        >
          <div className="text-gray-500 dark:text-slate-400 text-[10px] font-medium mb-1 text-center">
            Stock
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 relative flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Sold portion */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#155dfc"
                  strokeWidth="16"
                  strokeDasharray={`${soldPercentage * 2.51} ${251 - soldPercentage * 2.51}`}
                  className="transition-all duration-1000"
                />
                {/* Remaining portion */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="16"
                  strokeDasharray={`${remainingPercentage * 2.51} ${251 - remainingPercentage * 2.51}`}
                  strokeDashoffset={`-${soldPercentage * 2.51}`}
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-[10px] text-gray-600 dark:text-slate-300">
                    Sold
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {metrics.sold}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-[10px] text-gray-600 dark:text-slate-300">
                    Left
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {metrics.remaining}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Projection - More Compact */}
        {metrics.soldPerDay > 0 && (
          <div
            // title={`7-Day Sales Forecast: Projection based on current velocity of ${metrics.soldPerDay.toFixed(1)} units/day. WARNING: This is a rough estimate only. We don't know when sales actually occurred, so this assumes constant sales rate which may not reflect reality. Items listed ${metrics.daysListed} days ago may have very different recent performance.`}
            className="bg-gray-50/50 dark:bg-slate-700/20 rounded-md p-2 border border-gray-200 dark:border-slate-600/50"
          >
            <div className="text-gray-500 dark:text-slate-400 text-[10px] font-medium mb-1 text-center">
              7-Day Forecast
            </div>
            <div className="relative h-16 flex items-end gap-0.5 px-1">
              {projectionData.map((data, i) => {
                const soldHeight = (data.sold / metrics.totalStock) * 100;
                const remainingHeight =
                  (data.remaining / metrics.totalStock) * 100;

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col justify-end h-full group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded px-1.5 py-0.5 text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-sm">
                      <div className="text-blue-600">
                        S:{Math.round(data.sold)}
                      </div>
                      <div className="text-green-500">
                        L:{Math.round(data.remaining)}
                      </div>
                    </div>

                    {/* Remaining */}
                    <div
                      className="w-full bg-green-400 dark:bg-green-500 rounded-t transition-all duration-500"
                      style={{ height: `${remainingHeight}%` }}
                    />
                    {/* Sold */}
                    <div
                      className="w-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                      style={{ height: `${soldHeight}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[9px] text-gray-400 dark:text-slate-500">
                Now
              </span>
              {metrics.daysUntilSoldOut !== Infinity && (
                <span className="text-[9px] text-amber-500 dark:text-amber-400 font-semibold">
                  ~{metrics.daysUntilSoldOut}d
                </span>
              )}
              <span className="text-[9px] text-gray-400 dark:text-slate-500">
                +7d
              </span>
            </div>
          </div>
        )}

        {/* Quick Stats - Compact */}
        <div className="grid grid-cols-2 gap-2">
          <div
            // title={`Days Listed: This item has been active on eBay for ${metrics.daysListed} days. ${metrics.daysListed > 30 ? "Older listings may have experienced changing market conditions and demand patterns over time." : "Recent listing - metrics likely reflect current market demand."}`}
            className="bg-gray-50/50 dark:bg-slate-700/20 rounded-md p-1.5 border border-gray-200 dark:border-slate-600/50 text-center"
          >
            <div className="text-[9px] text-gray-500 dark:text-slate-400">
              Days Listed
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {metrics.daysListed}
            </div>
          </div>
          <div
            title={`Stock Remaining: ${metrics.stockPercentage.toFixed(1)}% of original inventory still available (${metrics.remaining} out of ${metrics.totalStock} units). ${metrics.stockPercentage < 30 ? "Low stock - may sell out soon if demand continues." : metrics.stockPercentage < 60 ? "Moderate stock levels remaining." : "Plenty of inventory still available."}`}
            className="bg-gray-50/50 dark:bg-slate-700/20 rounded-md p-1.5 border border-gray-200 dark:border-slate-600/50 text-center"
          >
            <div className="text-[9px] text-gray-500 dark:text-slate-400">
              Stock Left
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {metrics.stockPercentage.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {itemData.title && (
        <div
          // title={`Title Optimization: ${itemData.title.length} characters used out of 80 maximum. eBay titles with 60+ characters tend to perform better in search results as they can include more relevant keywords. ${itemData.title.length > 60 ? "This title is well-optimized for search visibility." : "Consider adding more descriptive keywords to improve searchability."}`}
          className="bg-gray-50 dark:bg-slate-800/30 rounded-lg p-3 border border-gray-200 dark:border-slate-700/50 mx-3 mb-3"
        >
          <div className="flex justify-between items-center ">
            <div className="flex items-center">
              <button
                onClick={() => {
                  showModal({
                    title: "Title Length Info",
                    content: <TitleLengthInfo />,
                  });
                }}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                title="Learn more about these metrics"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <span className="text-gray-600 dark:text-slate-400 text-xs font-medium flex">
                Title Length
              </span>
            </div>
            <span className="text-gray-700 dark:text-slate-300 text-xs">
              {itemData.title.length} chars
            </span>
          </div>
          <div className="h-2 bg-gray-300 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                itemData.title.length > 60
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-yellow-500 to-orange-500"
              }`}
              style={{
                width: `${Math.min((itemData.title.length / 80) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-slate-500">
              Poor
            </span>
            <span
              className={`text-xs font-bold ${
                itemData.title.length > 60
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {itemData.title.length > 60 ? "Optimized" : "Needs Work"}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-500">
              Great
            </span>
          </div>
        </div>
      )}

      {/* Compact Footer */}
      <div className="bg-gray-100 dark:bg-slate-800/50 px-2 py-1.5 border-t border-gray-300 dark:border-slate-700">
        <p className="text-[9px] text-gray-600 dark:text-slate-400 text-center ">
          {metrics.scarcityScore >= 70 && "⚡ High demand"}
          {metrics.scarcityScore >= 40 &&
            metrics.scarcityScore < 70 &&
            "📊 Steady sales"}
          {metrics.scarcityScore < 40 && "✨ Available"}
        </p>
        <p className="text-[9px] mt-2 border-t border-gray-950/10 dark:border-gray-100/20 text-center dark:text-main-white text-gray-500">
          @ebextractor
        </p>
      </div>
    </div>
  );
}

export default ScarcityChart;
