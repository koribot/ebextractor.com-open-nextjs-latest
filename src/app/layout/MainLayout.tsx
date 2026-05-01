import React, { Suspense } from "react";
import NavbarFallback from "../components/common/ui/fallbacks/NavbarFallback";
import Navbar from "../components/nav-bar/Navbar";
import BackToTopButton from "../components/common/ui/Buttons/BackToTop";
import Footer from "../components/footer/Footer";
import TopBanner from "../components/top-banner/TopBanner";
import PromotionBanner from "../components/promotion-banner/PromotionBanner";
import { JwtPayload } from "@supabase/supabase-js";
import AdSenseWrapperWithDynamicImport from "../components/ads/AdSenseWrapper";
import TabRefresher from "../components/tab-refresher/TabRefresher";
interface MainLayoutProps {
  children: React.ReactNode;
  userPayload?: JwtPayload | null | undefined;
}
const MainLayout: React.FC<MainLayoutProps> = async ({
  children,
  userPayload,
}) => {
  return (
    <>
      {/* <PromotionBanner /> */}
      <TabRefresher />
      <TopBanner />
      <AdSenseWrapperWithDynamicImport />
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      {children}
      <Footer />
      <BackToTopButton />
    </>
  );
};

export default MainLayout;
