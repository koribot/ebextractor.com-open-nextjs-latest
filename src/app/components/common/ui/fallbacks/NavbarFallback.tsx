import React from "react";

const NavLink = ({ 
  href, 
  children, 
  isActive = false,
  target = "_self"
}: { 
  href: string; 
  children: React.ReactNode; 
  isActive?: boolean;
  target?: string;
}) => (
  <a
    href={href}
    target={target}
    className={`text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition-all dark:text-gray-200 dark:hover:text-white ${
      isActive 
        ? "bg-gray-200 dark:bg-gray-700" 
        : "hover:bg-gray-100 dark:hover:bg-gray-800"
    }`}
  >
    {children}
  </a>
);

const SkeletonLoader = () => (
  <div className="animate-pulse flex items-center gap-2">
    <div className="h-8 bg-gray-200 rounded-md dark:bg-gray-700 w-20"></div>
    <div className="h-8 bg-gray-200 rounded-md dark:bg-gray-700 w-24"></div>
  </div>
);

const BurgerMenu = () => (
  <div className="hidden">
    <nav className="flex flex-col space-y-4 p-4">
      <NavLink href="/">Home</NavLink>
      <NavLink href="/search">Product Search</NavLink>
      <NavLink href="/deals">Deals</NavLink>
      <NavLink 
        href="https://www.thefamilyflips.com/pages/visit-our-store?udm_source=ebextractor.com"
        target="_blank"
      >
        Bin Store
      </NavLink>
      <div className="pt-2 border-t dark:border-gray-700">
        <SkeletonLoader />
      </div>
    </nav>
  </div>
);

const NavbarFallback = () => (
  <nav className="sticky top-0 z-[999] w-full bg-white shadow-md dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
    {/* Main Navigation */}
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <img
              src="/logo-icon-transparent.png"
              width={40}
              height={40}
              alt="Ebextractor logo"
              className="transition-transform group-hover:scale-110"
            />
          </div>
          <div className="hidden sm:block">
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-blue-400">
              eBextractor
            </span>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-1">
              Smart Product Research
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink href="/search">Search Tools</NavLink>
          <NavLink href="/deals">Deals</NavLink>
          <NavLink
            href="https://www.thefamilyflips.com/pages/visit-our-store?udm_source=ebextractor.com"
            target="_blank"
          >
            Bin Store
          </NavLink>
          <div className="ml-2">
            <SkeletonLoader />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Desktop Loading State */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="animate-pulse">
              <div className="h-9 bg-gray-200 rounded-md dark:bg-gray-700 w-28"></div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Menu (Hidden by default) */}
    <BurgerMenu />
  </nav>
);

export default NavbarFallback;


// import React from "react";

// const NavLink = ({ href, children, isActive = false }: { href: string; children: React.ReactNode; isActive?: boolean }) => (
//   <a
//     href={href}
//     className={`text-blue-600 hover:underline font-medium p-2 transition-colors ${
//       isActive ? "border-1 bg-gray-200" : ""
//     }`}
//   >
//     {children}
//   </a>
// );

// const BurgerMenu = () => (
//   <div className="hidden">
//     <nav className="flex flex-col space-y-4 mt-16">
//       <NavLink href="/">Home</NavLink>
//       <NavLink href="/search">Ebay-Amazon Search</NavLink>
//       <NavLink href="https://app.ebextractor.com">Product research</NavLink>
//       <div className="animate-pulse">
//         <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-24"></div>
//       </div>
//     </nav>
//   </div>
// );

// const NavbarFallback = () => (
//   <nav className="sticky top-0 z-50 w-full bg-gray-100 shadow-sm border-b border-black border-opacity-20 opacity-95 dark:bg-dark">
//     <div className="container mx-auto px-4">
//       <div className="flex items-center justify-between h-16">
//         <a href="/" className="flex items-center">
//           <img
//             src="/logo-icon-transparent.png"
//             width={25}
//             height={25}
//             alt="Ebextractor logo"
//             className="mr-2"
//           />
//           <span className="text-emerald-900 font-bold text-lg hidden sm:inline">
//             eBextractor
//           </span>
//         </a>
//         <div className="hidden md:flex space-x-4">
//           <NavLink href="/search">Ebay-Amazon Search</NavLink>
//           <a
//             className="text-blue-600 hover:underline font-medium p-2 rounded-full"
//             target="_blank"
//             rel="noopener noreferrer"
//             href="https://app.ebextractor.com/"
//           >
//             Product research
//           </a>
//           <div className="animate-pulse flex items-center">
//             <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-24"></div>
//           </div>
//         </div>
//         <button
//           className="md:hidden text-gray-600 text-2xl"
//           aria-label="Menu"
//         >
//           &#9776;
//         </button>
//       </div>
//     </div>
//     <BurgerMenu />
//   </nav>
// );

// export default NavbarFallback;