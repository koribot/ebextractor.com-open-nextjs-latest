"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import SpinnerFallback from "./SpinnerFallback";
import { getCookie } from "cookies-next/client";

interface Props {
  additionalDelay?: number; // in milliseconds
}

const ShowSpinnerFallBackWithDelay: React.FC<Props> = ({
  additionalDelay = 500,
}) => {
  const [mounted, setMounted] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);
  const theme = getCookie("theme");
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        setShowSpinner(false);
      }, additionalDelay);

      return () => clearTimeout(timer);
    }
  }, [mounted, additionalDelay]);

  return showSpinner && <SpinnerFallback isDark={theme === "dark"} />;
};

export default ShowSpinnerFallBackWithDelay;
