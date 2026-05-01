"use client";

import { useState, useEffect } from "react";
import { FaArrowCircleUp } from "react-icons/fa";

const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="flex flex-col fixed bottom-4 right-4 items-center"
        >
          <span className="back-to-top w-fit text-white text-4xl bg-main-bg rounded-full">
            <FaArrowCircleUp />
          </span>
          {/* <p>Back to top</p> */}
        </button>
      )}
    </>
  );
};

export default BackToTopButton;
