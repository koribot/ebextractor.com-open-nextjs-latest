import React, { Suspense } from "react";
import MainLayout from "../layout/MainLayout";
import SearchByImageInput from "../components/products-search-from-marketplaces/SearchByImageInput";
import Loading from "./loading";

const page = () => {
  return (
    <MainLayout>
      <Suspense fallback={<Loading />}>
        <SearchByImageInput />
      </Suspense>
    </MainLayout>
  );
};

export default page;
