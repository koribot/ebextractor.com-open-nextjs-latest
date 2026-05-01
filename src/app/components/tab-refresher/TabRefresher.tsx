"use client";
import { useEffect } from "react";

const TabRefresher = () => {
  useEffect(() => {
    const bc = new BroadcastChannel("refresh");
    bc.onmessage = (event) => {
      if (event.data === "refresh") {
        window.location.reload();
      }
    };
  }, []);
  return null;
};
export default TabRefresher;
