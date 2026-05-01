import React from "react";
import MainLayout from "../layout/MainLayout";
import EbaySearchBySeller from "../components/ebay-search-by-seller/EbaySearchBySeller";

const page = () => {
  return (
    <MainLayout>
      <EbaySearchBySeller />
    </MainLayout>
  );
};

export default page;
