import React from "react";

const DotdotdotLoading = ({ color = "white" }) => {
  return (
    <div className="flex flex-row gap-2">
      <div
        style={{ backgroundColor: color }}
        className="w-2 h-2 rounded-full animate-bounce"
      />
      <div
        style={{ backgroundColor: color }}
        className="w-2 h-2 rounded-full animate-bounce"
      />
      <div
        style={{ backgroundColor: color }}
        className="w-2 h-2 rounded-full animate-bounce"
      />
    </div>
  );
};

export default DotdotdotLoading;
