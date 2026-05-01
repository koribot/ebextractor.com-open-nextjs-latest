import React from "react";
import CategorySidebar from "../components/deals/CategorySidebar";
import MainLayout from "../layout/MainLayout";
import DealsEventsAndOthersLandingContent from "../components/deals/DealsEventsAndOthersLandingContent";

export default function Page(): React.ReactElement {
  return (
    <MainLayout>
      <div className="bg-main-white dark:bg-light-dark">
        <div className="flex p-5 flex-col lg:flex-row">
          {/* Sidebar */}
          <CategorySidebar path="deals" />
          {/* Main Content Area */}
          <DealsEventsAndOthersLandingContent />
        </div>
      </div>
    </MainLayout>
  );
}
