
import React from "react";
import Image from "next/image";
import logo from "@/app/contants/logo";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  logoText?: string;
  isDark?: boolean;
}

const SpinnerFallback: React.FC<SpinnerProps> = ({
  size = "md",
  logoText = "eBextractor",
}) => {
  // Our eye-friendly colors
  const colors = {
    main: "rgb(6, 78, 100)",           // Dark blue-green
    spinner: "rgb(20, 184, 166)",      // Teal for visibility
    text: "rgb(209, 213, 219)",        // Light gray text for contrast
    accent: "rgb(14, 116, 144)"        // Deep teal accent
  };

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center !z-[999999999999999999] w-[100vw] min-h-screen flex-col overflow-hidden bg-gradient-to-b from-gray-600 to-gray-800"
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-current border-r-transparent`}
          role="status"
          style={{ borderColor: colors.spinner, borderRightColor: 'transparent' }}
        />

        {/* Loading text */}
        <div style={{ color: colors.text }}>
          <span className="sr-only">Loading</span>
          <span className="text-sm">Please wait</span>
        </div>
      </div>

      {/* Logo section at bottom */}
      <div className="fixed bottom-8 flex flex-col items-center space-y-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <Image src={logo} alt="Logo" width={32} height={32} />
        </div>
        <span
          className="text-sm"
          style={{ color: colors.text }}
        >
          {logoText}
        </span>
      </div>
    </div>
  );
};

export default SpinnerFallback;





// "use client";

// import React from "react";
// import Image from "next/image";
// import logo from "../../../../../public/logo-icon-transparent.png";

// interface SpinnerProps {
//   size?: "sm" | "md" | "lg";
//   logoText?: string;
//   message?: string;
//   isDark?: boolean; // Accept isDark as prop from server
// }

// const SpinnerFallback: React.FC<SpinnerProps> = ({
//   size = "md",
//   logoText = "eBextractor",
//   message = "Please wait",
//   isDark = false, // Default to light theme if not provided
// }) => {
//   const sizeConfig = {
//     sm: {
//       spinner: "w-6 h-6",
//       border: "border-2",
//       logo: { width: 32, height: 32 },
//       container: "w-8 h-8",
//     },
//     md: {
//       spinner: "w-10 h-10",
//       border: "border-3",
//       logo: { width: 48, height: 48 },
//       container: "w-12 h-12",
//     },
//     lg: {
//       spinner: "w-16 h-16",
//       border: "border-4",
//       logo: { width: 56, height: 56 },
//       container: "w-14 h-14",
//     },
//   };

//   const config = sizeConfig[size];

//   return (
//     <>
//       <style jsx>{`
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes fade-in-up {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fade-in {
//           animation: fade-in 0.6s ease-out;
//         }

//         .animate-fade-in-up {
//           animation: fade-in-up 0.8s ease-out 0.2s both;
//         }
//       `}</style>

//       <div
//         className="fixed inset-0 flex items-center justify-center z-[9999] w-full min-h-screen flex-col overflow-hidden bg-gradient-to-br from-gray-600 via-gray-500 to-slate-600"
//       >
//         {/* Main loading content */}
//         <div className="flex flex-col items-center space-y-6 animate-fade-in">
//           {/* Enhanced Spinner with pulse effect */}
//           <div className="relative">
//             {/* Outer glow ring */}
//             <div
//               className={`${
//                 config.spinner
//               } absolute animate-ping rounded-full ${
//                 isDark ? "bg-teal-300/20" : "bg-teal-400/20"
//               }`}
//             />

//             {/* Main spinner */}
//             <div
//               className={`${config.spinner} ${
//                 config.border
//               } animate-spin rounded-full border-r-transparent relative ${
//                 isDark ? "border-teal-400" : "border-teal-500"
//               }`}
//               role="status"
//               aria-label="Loading"
//             />

//             {/* Inner dot */}
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div
//                 className={`w-2 h-2 rounded-full animate-pulse ${
//                   isDark ? "bg-teal-400" : "bg-teal-500"
//                 }`}
//               />
//             </div>
//           </div>

//           {/* Loading text with fade animation */}
//           <div className="text-center space-y-2 animate-pulse">
//             <div className={isDark ? "text-gray-200" : "text-gray-200"}>
//               <span className="sr-only">Loading</span>
//               <span className="text-sm font-medium">{message}</span>
//             </div>

//             {/* Loading dots animation */}
//             <div className="flex justify-center space-x-1">
//               <div
//                 className={`w-1 h-1 rounded-full animate-bounce [animation-delay:-0.3s] ${
//                   isDark ? "bg-teal-400" : "bg-teal-500"
//                 }`}
//               />
//               <div
//                 className={`w-1 h-1 rounded-full animate-bounce [animation-delay:-0.15s] ${
//                   isDark ? "bg-teal-400" : "bg-teal-500"
//                 }`}
//               />
//               <div
//                 className={`w-1 h-1 rounded-full animate-bounce ${
//                   isDark ? "bg-teal-400" : "bg-teal-500"
//                 }`}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Enhanced logo section */}
//         <div className="fixed bottom-8 flex flex-col items-center space-y-3 animate-fade-in-up">
//           <div
//             className={`${
//               config.container
//             } flex items-center justify-center hover:scale-105 transition-transform duration-200`}
//           >
//             <Image
//               src={logo}
//               alt={`${logoText} Logo`}
//               width={config.logo.width}
//               height={config.logo.height}
//               className="drop-shadow-sm"
//               priority
//             />
//           </div>
//           <span
//             className={`text-sm font-medium tracking-wide ${
//               isDark ? "text-gray-200" : "text-gray-200"
//             }`}
//           >
//             {logoText}
//           </span>
//         </div>
//       </div>
//     </>
//   );
// };

// export default SpinnerFallback;


// "use client";

// import React from "react";
// import Image from "next/image";
// import logo from "../../../../../public/logo-icon-transparent.png";

// interface SpinnerProps {
//   size?: "sm" | "md" | "lg";
//   logoText?: string;
//   message?: string;
//   isDark?: boolean; // Accept isDark as prop from server
// }

// const SpinnerFallback: React.FC<SpinnerProps> = ({
//   size = "md",
//   logoText = "eBextractor",
//   message = "Please wait",
//   isDark = false, // Default to light theme if not provided
// }) => {
//   const sizeConfig = {
//     sm: {
//       spinner: "w-6 h-6",
//       border: "border-2",
//       logo: { width: 24, height: 24 },
//       container: "w-6 h-6",
//     },
//     md: {
//       spinner: "w-10 h-10",
//       border: "border-3",
//       logo: { width: 32, height: 32 },
//       container: "w-8 h-8",
//     },
//     lg: {
//       spinner: "w-16 h-16",
//       border: "border-4",
//       logo: { width: 40, height: 40 },
//       container: "w-10 h-10",
//     },
//   };

//   const config = sizeConfig[size];

//   return (
//     <>
//       <style jsx>{`
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes fade-in-up {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fade-in {
//           animation: fade-in 0.6s ease-out;
//         }

//         .animate-fade-in-up {
//           animation: fade-in-up 0.8s ease-out 0.2s both;
//         }
//       `}</style>

//       <div
//         className={`fixed inset-0 flex items-center justify-center z-[9999] w-full min-h-screen flex-col overflow-hidden ${
//           isDark
//             ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800"
//             : "bg-gradient-to-br from-slate-50 via-white to-gray-100"
//         }`}
//       >
//         {/* Main loading content */}
//         <div className="flex flex-col items-center space-y-6 animate-fade-in">
//           {/* Enhanced Spinner with pulse effect */}
//           <div className="relative">
//             {/* Outer glow ring */}
//             <div
//               className={`${
//                 config.spinner
//               } absolute animate-ping rounded-full ${
//                 isDark ? "bg-teal-300/20" : "bg-teal-400/20"
//               }`}
//             />

//             {/* Main spinner */}
//             <div
//               className={`${config.spinner} ${
//                 config.border
//               } animate-spin rounded-full border-r-transparent relative ${
//                 isDark ? "border-teal-400" : "border-teal-500"
//               }`}
//               role="status"
//               aria-label="Loading"
//             />

//             {/* Inner dot */}
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div
//                 className={`w-2 h-2 rounded-full animate-pulse ${
//                   isDark ? "bg-teal-400" : "bg-teal-500"
//                 }`}
//               />
//             </div>
//           </div>

//           {/* Loading text with fade animation */}
//           <div className="text-center space-y-2 animate-pulse">
//             <div className={isDark ? "text-gray-300" : "text-gray-600"}>
//               <span className="sr-only">Loading</span>
//               <span className="text-sm font-medium">{message}</span>
//             </div>

//             {/* Loading dots animation */}
//             <div className="flex justify-center space-x-1">
//               <div
//                 className={`w-1 h-1 rounded-full animate-bounce [animation-delay:-0.3s] ${
//                   isDark ? "bg-teal-400" : "bg-teal-500"
//                 }`}
//               />
//               <div
//                 className={`w-1 h-1 rounded-full animate-bounce [animation-delay:-0.15s] ${
//                   isDark ? "bg-teal-400" : "bg-teal-500"
//                 }`}
//               />
//               <div
//                 className={`w-1 h-1 rounded-full animate-bounce ${
//                   isDark ? "bg-teal-400" : "bg-teal-500"
//                 }`}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Enhanced logo section */}
//         <div className="fixed bottom-8 flex flex-col items-center space-y-3 animate-fade-in-up">
//           <div
//             className={`${
//               config.container
//             } rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200 ${
//               isDark
//                 ? "bg-gray-800/50 border border-gray-700/30"
//                 : "bg-white/10 border border-gray-200/20"
//             }`}
//           >
//             <Image
//               src={logo}
//               alt={`${logoText} Logo`}
//               width={config.logo.width}
//               height={config.logo.height}
//               className="drop-shadow-sm"
//               priority
//             />
//           </div>
//           <span
//             className={`text-sm font-medium tracking-wide ${
//               isDark ? "text-gray-400" : "text-gray-500"
//             }`}
//           >
//             {logoText}
//           </span>
//         </div>
//       </div>
//     </>
//   );
// };

// export default SpinnerFallback;