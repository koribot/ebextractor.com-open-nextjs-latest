"use client";
import dynamic from "next/dynamic";
import React from "react";
const AdBanner = dynamic(() => import("./AdBanner"), {
  ssr: false,
  loading: () => (
    <div className="h-24 w-full bg-gray-100 animate-pulse rounded" />
  ),
});
const AdSenseWrapperWithDynamicImport = () => {
  return <AdBanner />;
};

export default AdSenseWrapperWithDynamicImport;
