"use client";
import React, { ReactNode } from "react";
import { createRoot } from "react-dom/client";

type ModalOptions = {
  title?: string;
  content: ReactNode;
  containerClassName?: string; // Add this
  showTitle?: boolean; // Add this
  modalId?: string; // Add this
};

export const showModal = ({
  title,
  content,
  containerClassName,
  showTitle = true,
  modalId = "ebextractor-modal-container", // default modal first layer id
}: ModalOptions) => {
  const modalContainer = document.createElement("div");

  // to make sure uniqueness of each modal id
  const addedRandomness =
    Math.random().toString(36).substring(2, 9) +
    new Date().getTime().toString();
  modalContainer.id = `${modalId}~${addedRandomness}`;
  modalContainer.setAttribute("data-attritute", "ebextractor-modal");
  const exitingModals = document.querySelectorAll(
    "[data-attritute='ebextractor-modal']",
  );
  document.body.appendChild(modalContainer);

  const hideModal = () => {
    if (modalContainer && document.body.contains(modalContainer)) {
      root.unmount();
      document.body.removeChild(modalContainer);
      document.body.style.overflow = "unset";
    }
  };

  // Prevent body scroll
  document.body.style.overflow = "hidden";

  const ModalComponent = () => (
    <div
      onClick={hideModal}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
    >
      <div
        // to avoid bg being too dark we set the max modal to have bg
        className={`absolute inset-0 ${exitingModals.length <= 1 ? "bg-black/50" : "bg-transparent"} transition-opacity`}
        onClick={hideModal}
      />
      <div
        className={
          containerClassName ||
          "bg-white dark:bg-dark shadow-lg p-6 max-w-[90%] overflow-auto small-scrollbar max-h-[90%] z-[1003] relative rounded-lg"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/*{showTitle && title && (*/}
        <div
          className={`flex justify-between items-center ${showTitle && title ? "border-b" : "border-none"} pb-2 mb-4 w-full`}
        >
          {showTitle && title && (
            <h2 className="text-xl font-semibold">{title}</h2>
          )}
          <button
            title="Close Modal"
            className="text-gray-500 hover:text-black dark:hover:text-white text-xl absolute top-0 right-0 mt-2 mr-2 cursor-pointer"
            onClick={hideModal}
          >
            ✕
          </button>
        </div>
        {/*)}*/}
        <div className="">{content}</div>
      </div>
    </div>
  );

  const root = createRoot(modalContainer);
  root.render(<ModalComponent />);
};
