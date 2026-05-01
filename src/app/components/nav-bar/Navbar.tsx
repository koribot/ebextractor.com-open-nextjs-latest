"use client";
import {
  FaImage,
  FaSearch,
  FaSearchDollar,
  FaUser,
  FaUserTie,
  FaHeart,
  FaBell,
  FaShoppingCart,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/store/auth/store";
import { Spinner } from "../common/ui/Spinner";
import ToggleTheme from "../Theme/ToggleTheme";
import {
  FaDiscord,
  FaMagnifyingGlass,
  FaUsers,
  FaYoutube,
  FaBars,
  FaXmark,
} from "react-icons/fa6";
import { getCookies } from "cookies-next/client";
import { CategoriesNavbar } from "../home/CategoriesNavbar";
import logo from "@/app/contants/logo";
import { xorDecode } from "@/app/utils/simpleObfuscator";
import { logger } from "@/app/utils/logger";

const NavLink = ({
  href,
  children,
  target = "_self",
  cname = "",
}: {
  href: string;
  children: React.ReactNode;
  target?: string;
  cname?: string;
}) => {
  const pathname = usePathname();
  const isActive =
    pathname === (href.includes("?") ? href.split("?")[0] : href);

  return href === "/search" ? (
    <Link
      prefetch={false}
      target={target}
      href={`${pathname === "/search" ? "#" : href}`}
      className={`${
        cname !== ""
          ? cname
          : "text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition-all dark:text-gray-200 dark:hover:text-white"
      } ${
        isActive
          ? "bg-gray-200 dark:bg-gray-700"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </Link>
  ) : (
    <Link
      prefetch={false}
      target={target}
      href={href}
      className={`${
        cname !== ""
          ? cname
          : "text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition-all dark:text-gray-200 dark:hover:text-white"
      } ${
        isActive
          ? "bg-gray-200 dark:bg-gray-700"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </Link>
  );
};

const ProductSearchDropdown = () => {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, []);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const ProductSearchContent = () => (
    <div
      onMouseEnter={() => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        timeoutIdRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 300);
      }}
      className="w-full py-1"
    >
      <NavLink
        href="/search"
        cname="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors"
      >
        <FaMagnifyingGlass className="w-4 h-4 text-gray-500" />
        <div>
          <div className="font-medium">Normal Search</div>
          <div className="text-xs text-gray-500">
            Search products across multiple marketplaces
          </div>
        </div>
      </NavLink>
      <NavLink
        href="/ebay-image-search"
        cname="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors"
      >
        <FaImage className="w-4 h-4 text-blue-500" />
        <div>
          <div className="font-medium">Image Search</div>
          <div className="text-xs text-gray-500">
            Find items using photos on eBay
          </div>
        </div>
      </NavLink>
      <NavLink
        href="/ebay-search-by-seller"
        cname="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors"
      >
        <FaUserTie className="w-4 h-4 text-green-500" />
        <div>
          <div className="font-medium">Seller Search</div>
          <div className="text-xs text-gray-500">
            Browse by specific sellers on eBay
          </div>
        </div>
      </NavLink>
    </div>
  );

  return (
    <div
      onMouseLeave={() => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        timeoutIdRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 500);
      }}
      className="relative"
    >
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition-all dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <FaSearchDollar className="w-4 h-4" />
        <span>Search Tools</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Desktop Dropdown */}
      {isOpen && (
        <div className="hidden md:block absolute left-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 dark:bg-gray-900 dark:border-gray-700">
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white dark:bg-gray-900 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45" />
          <ProductSearchContent />
        </div>
      )}

      {/* Mobile Modal */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaSearch className="w-5 h-5 text-blue-600" />
                Search Tools
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FaXmark className="w-6 h-6" />
              </button>
            </div>
            <ProductSearchContent />
          </div>
        </div>
      )}
    </div>
  );
};

const ServicesDropdown = () => {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, []);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const ServicesContent = () => (
    <div
      onMouseEnter={() => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        timeoutIdRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 300);
      }}
      className="w-full py-1"
    >
      <Link
        prefetch={false}
        href="https://discord.com/invite/6W4HkVr7bD"
        target="_blank"
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors"
      >
        <FaDiscord className="w-5 h-5 text-indigo-600" />
        <div>
          <div className="font-medium">Discord</div>
          <div className="text-xs text-gray-500">Join our community</div>
        </div>
      </Link>
      <Link
        prefetch={false}
        href="https://www.youtube.com/@eBex-tractor"
        target="_blank"
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors"
      >
        <FaYoutube className="w-5 h-5 text-red-600" />
        <div>
          <div className="font-medium">YouTube</div>
          <div className="text-xs text-gray-500">Watch tutorials & tips</div>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition-all dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <FaUsers className="w-4 h-4" />
        <span>Services</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Desktop Dropdown */}
      {isOpen && (
        <div className="hidden md:block absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 dark:bg-gray-900 dark:border-gray-700">
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white dark:bg-gray-900 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45" />
          <ServicesContent />
        </div>
      )}

      {/* Mobile Modal */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaUsers className="w-5 h-5 text-blue-600" />
                Community
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FaXmark className="w-6 h-6" />
              </button>
            </div>
            <ServicesContent />
          </div>
        </div>
      )}
    </div>
  );
};

const CommunityDropdown = () => {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, []);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const CommunityContent = () => (
    <div
      onMouseEnter={() => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        timeoutIdRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 300);
      }}
      className="w-full py-1"
    >
      <Link
        prefetch={false}
        href="https://discord.com/invite/6W4HkVr7bD"
        target="_blank"
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors"
      >
        <FaDiscord className="w-5 h-5 text-indigo-600" />
        <div>
          <div className="font-medium">Discord</div>
          <div className="text-xs text-gray-500">Join our community</div>
        </div>
      </Link>
      <Link
        prefetch={false}
        href="https://www.youtube.com/@eBex-tractor"
        target="_blank"
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors"
      >
        <FaYoutube className="w-5 h-5 text-red-600" />
        <div>
          <div className="font-medium">YouTube</div>
          <div className="text-xs text-gray-500">Watch tutorials & tips</div>
        </div>
      </Link>
    </div>
  );

  return (
    <div
      onMouseLeave={() => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        timeoutIdRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 500);
      }}
      className="relative"
    >
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition-all dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <FaUsers className="w-4 h-4" />
        <span>Community</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Desktop Dropdown */}
      {isOpen && (
        <div className="hidden md:block absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 dark:bg-gray-900 dark:border-gray-700">
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white dark:bg-gray-900 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45" />
          <CommunityContent />
        </div>
      )}

      {/* Mobile Modal */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaUsers className="w-5 h-5 text-blue-600" />
                Community
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FaXmark className="w-6 h-6" />
              </button>
            </div>
            <CommunityContent />
          </div>
        </div>
      )}
    </div>
  );
};

const AccountDropdown = () => {
  const cookies = getCookies();
  const params = useSearchParams();
  const pathName = usePathname();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isLoading, hydrateUser, logout } = useAuthStore();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    const avtr = cookies?.avtr;
    const decodedAvtr = avtr && xorDecode(decodeURIComponent(avtr));
    setAvatarUrl(decodedAvtr);
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
    return () => {
      setIsOpen(false);
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, []);

  const handleClick = async () => {
    if (!isMounted) return;
    setIsOpen(!isOpen);
    if (!user && cookies?.authenticatedUser) await hydrateUser();
  };

  const AccountContent = () =>
    typeof window !== "undefined" &&
    isMounted && (
      <div
        onMouseEnter={() => {
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
          }
          setIsOpen(true);
        }}
        onMouseLeave={() => {
          timeoutIdRef.current = setTimeout(() => {
            setIsOpen(false);
          }, 300);
        }}
        className="py-1"
      >
        {user?.email && (
          <div className="px-4 py-3 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Image
                src={user?.profilePic || "/default_profile.png"}
                width={48}
                height={48}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner size={24} color="gray-700" />
          </div>
        )}

        {!isLoading && (
          <div className="py-1">
            {!user?.email && (
              <Link
                prefetch={false}
                href={`/login${
                  pathName !== "/"
                    ? `?callback_url=${encodeURIComponent(
                        pathName +
                          (params.size > 0 ? "?" + params.toString() : ""),
                      )}`
                    : ""
                }`}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors"
              >
                <FaUser className="w-4 h-4" />
                <span className="font-medium">Sign In / Register</span>
              </Link>
            )}

            <Link
              prefetch={false}
              href="/my-saved"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 transition-colors"
            >
              <FaHeart className="w-4 h-4" />
              <span>My Saved</span>
            </Link>

            {user?.email && (
              <button
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 transition-colors border-t dark:border-gray-700"
                onClick={logout}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}
      </div>
    );

  return (
    <div
      onMouseLeave={() => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        timeoutIdRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 500);
      }}
      className="relative"
    >
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition-all dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {user?.profilePic ? (
          <Image
            src={user.profilePic}
            width={24}
            height={24}
            alt="Profile"
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : avatarUrl ? (
          <Image
            src={avatarUrl}
            width={24}
            height={24}
            alt="Profile"
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <FaUser className="w-4 h-4" />
        )}
        <span>Account</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Desktop Dropdown */}
      {isOpen && (
        <div className="hidden md:block absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 dark:bg-gray-900 dark:border-gray-700">
          <div className="absolute -top-2 right-6 w-4 h-4 bg-white dark:bg-gray-900 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45" />
          <AccountContent />
        </div>
      )}

      {/* Mobile Modal */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FaXmark className="w-6 h-6" />
              </button>
            </div>
            <AccountContent />
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Main Navbar */}
      <nav className="sticky top-0 z-[999] w-full bg-gray-100 shadow-sm dark:bg-light-dark border-b border-gray-200 dark:border-gray-800">
        {/* Main Navigation */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 ">
            {/* Logo */}
            <div className="flex items-center gap-2 group">
              <Link prefetch={false} href="/" className="relative">
                <Image
                  src={logo}
                  width={40}
                  height={40}
                  alt="Ebextractor logo"
                  // className="transition-transform group-hover:scale-110"
                />
              </Link>
              <div className="hidden lg:block">
                <NavLink href="https://services-offered.ebextractor.com/?ref=ebextractor.com" target="_blank" >Services</NavLink>
                <NavLink href="/deals">Deals</NavLink>
                <NavLink
                  href="https://www.thefamilyflips.com/pages/visit-our-store?udm_source=ebextractor.com"
                  target="_blank"
                >
                  Bin Store
                </NavLink>
                {/* <span className="text-emerald-900 font-bold text-lg hidden sm:inline dark:text-light">
                  eBextractor
                </span> */}
                {/* <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-1">
                  Smart Product Research
                </p> */}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {/* <NavLink href="/deals">Deals</NavLink>
              <NavLink
                href="https://www.thefamilyflips.com/pages/visit-our-store?udm_source=ebextractor.com"
                target="_blank"
              >
                Bin Store
              </NavLink> */}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Desktop Account and Theme Toggle */}
              <div className="hidden lg:flex items-center gap-2">
                <ProductSearchDropdown />
                <CommunityDropdown />
                {/* <ServicesDropdown /> */}
                <AccountDropdown />
                <ToggleTheme />
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <FaBars className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60"
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              className="fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-800 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo-icon-transparent.png"
                    width={32}
                    height={32}
                    alt="Logo"
                    className="brightness-0 invert"
                  />
                  <span className="text-white font-bold text-lg">
                    eBextractor
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <FaXmark className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex flex-col h-[calc(100%-73px)]">
                <div className="flex-1 overflow-y-auto">
                  {/* Account Section with Theme Toggle */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Account
                      </h3>
                      <ToggleTheme />
                    </div>
                    <AccountDropdown />
                  </div>

                  {/* Navigation Links */}
                  <div className="p-4 space-y-1">
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                        Navigation
                      </h3>
                      <div className="space-y-1">
                        <Link
                          prefetch={false}
                          href="/"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          <span className="font-medium">Home</span>
                        </Link>

                        <Link
                          prefetch={false}
                          onClick={() => setIsMenuOpen(false)}
                          href="https://services-offered.ebextractor.com/?ref=ebextractor.com"
                          target="_blank"
                          className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          <span className="font-medium">Services</span>
                        </Link>

                        <Link
                          prefetch={false}
                          href="/deals"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-medium">Deals</span>
                        </Link>
                        <Link
                          prefetch={false}
                          href="https://www.thefamilyflips.com/pages/visit-our-store?udm_source=ebextractor.com"
                          target="_blank"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          <span className="font-medium">Bin Store</span>
                        </Link>
                      </div>
                    </div>

                    <div className="border-t dark:border-gray-800 pt-4">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                        Search Tools
                      </h3>
                      <div className="space-y-1">
                        <Link
                          prefetch={false}
                          href="/search"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <FaMagnifyingGlass className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium">Normal Search</div>
                            <div className="text-xs text-gray-500">
                              Search products across multiple marketplaces
                            </div>
                          </div>
                        </Link>
                        <Link
                          prefetch={false}
                          href="/ebay-image-search"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <FaImage className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Image Search</div>
                            <div className="text-xs text-gray-500">
                              Find items using photos on eBay
                            </div>
                          </div>
                        </Link>
                        <Link
                          prefetch={false}
                          href="/ebay-search-by-seller"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <FaUserTie className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="font-medium">Seller Search</div>
                            <div className="text-xs text-gray-500">
                              Browse by specific sellers on eBay
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    <div className="border-t dark:border-gray-800 pt-4">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                        Community
                      </h3>
                      <div className="space-y-1">
                        <Link
                          prefetch={false}
                          href="https://discord.com/invite/6W4HkVr7bD"
                          target="_blank"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <FaDiscord className="w-5 h-5 text-indigo-600" />
                          <div>
                            <div className="font-medium">Discord</div>
                            <div className="text-xs text-gray-500">
                              Join our community
                            </div>
                          </div>
                        </Link>
                        <Link
                          prefetch={false}
                          href="https://www.youtube.com/@eBex-tractor"
                          target="_blank"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <FaYoutube className="w-5 h-5 text-red-600" />
                          <div>
                            <div className="font-medium">YouTube</div>
                            <div className="text-xs text-gray-500">
                              Watch tutorials & tips
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Categories Navbar */}
      <CategoriesNavbar />
    </>
  );
};

export default Navbar;

// "use client";
// import {
//   FaImage,
//   FaSearch,
//   FaSearchDollar,
//   FaUser,
//   FaUserTie,
// } from "react-icons/fa";
// import Image from "next/image";
// import Link from "next/link";
// import { useEffect, useRef, useState } from "react";
// import { usePathname, useSearchParams } from "next/navigation";
// import { useAuthStore } from "@/app/store/auth/store";
// import { Spinner } from "../common/ui/Spinner";
// import ToggleTheme from "../Theme/ToggleTheme";
// import {
//   FaDiscord,
//   FaMagnifyingGlass,
//   FaUsers,
//   FaYoutube,
// } from "react-icons/fa6";
// import { getCookies } from "cookies-next/client";
// import { CategoriesNavbar } from "../home/CategoriesNavbar";

// const NavLink = ({
//   href,
//   children,
//   target = "_self",
//   cname = "",
// }: {
//   href: string;
//   children: React.ReactNode;
//   target?: string;
//   cname?: string;
// }) => {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const h = href.includes("?") ? href.split("?")[0] : href;
//   const isActive = pathname === h;
//   return href === "/search" ? (
//     <Link
//       target={target}
//       href={`${pathname === "/search" ? "#" : href} `}
//       className={`${
//         cname !== ""
//           ? cname
//           : "text-xs text-blue-600 hover:underline font-medium p-2 transition-colors dark:text-light"
//       } ${
//         isActive
//           ? "border-1 bg-gray-200 dark:bg-gray-700 dark:border-gray-700"
//           : ""
//       }`}
//     >
//       {children}
//     </Link>
//   ) : (
//     <Link
//       target={target}
//       href={href}
//       className={`${
//         cname !== ""
//           ? cname
//           : "text-xs text-blue-600 hover:underline font-medium p-2 transition-colors dark:text-light "
//       } ${
//         isActive
//           ? "border-1 bg-gray-200 dark:bg-gray-700 dark:border-gray-700"
//           : ""
//       }`}
//     >
//       {children}
//     </Link>
//   );
// };

// // const AccountDropdown = () => {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [isMounted, setIsMounted] = useState(false);
// //   const { email, username, isLoading, hydrateUser, logout } = useAuthStore();

// //   useEffect(() => {
// //     if (typeof window !== "undefined") {
// //       setIsMounted(true);
// //       hydrateUser();
// //     }

// //     return () => {
// //       setIsOpen(false);
// //     };
// //   }, []);

// //   const handleClick = async () => {
// //     if (!isMounted) return;
// //     setIsOpen(!isOpen);
// //     await hydrateUser();
// //   };

// //   return (
// //     <div className="relative">
// //       <button
// //         onClick={handleClick}
// //         className="flex items-center justify-center space-x-2 text-blue-600 dark:text-light"
// //       >
// //         <FaUser className="w-5 h-5" />
// //         <span className="">Account</span>
// //       </button>

// //       {isOpen && (
// //         <div className="absolute left-1/2 -translate-x-1/2 flex flex-col mt-2 min-w-48 w-[fit-content] bg-white rounded-md shadow-lg py-1 z-50 min-h-[80px] dark:bg-dark dark:border-gray-700 dark:border">
// //           {isLoading && email !== "" ? (
// //             <Spinner className="mx-auto w-48 h-8 my-auto" />
// //           ) : (
// //             <div>
// //               {typeof window !== "undefined" && (
// //                 <>
// //                   {email !== "" && (
// //                     <button className="px-4 gap-1 py-2 text-sm flex items-center hover:underline">
// //                       <p className="text-blue-600 dark:text-light">Hello! </p>{" "}
// //                       <p className="font-bold text-blue-600 dark:text-light">
// //                         {username !== "" ? username : email}
// //                       </p>
// //                     </button>
// //                   )}
// //                   {email !== "" ? (
// //                     <button
// //                       className="block w-full px-4 py-2 text-sm text-blue-600 hover:underline dark:text-light"
// //                       onClick={logout}
// //                     >
// //                       Log out
// //                     </button>
// //                   ) : (
// //                     <Link
// //                       href="/login"
// //                       className="block w-full px-4 py-2 text-sm text-blue-600 hover:underline dark:text-light"
// //                     >
// //                       Log in
// //                     </Link>
// //                   )}
// //                   {email === "" && (
// //                     <Link
// //                       href="/signup"
// //                       className="block w-full px-4 py-2 text-sm text-blue-600 hover:underline dark:text-light"
// //                     >
// //                       Create Account
// //                     </Link>
// //                   )}
// //                 </>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// const ProductSearchDropdown = () => {
//   const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     return () => {
//       if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
//     };
//   }, []);

//   const handleClick = () => {
//     setIsOpen(!isOpen);
//   };

//   const ProductSearchContent = () => (
//     <div className="w-full">
//       <NavLink
//         href="/search"
//         cname="flex items-center gap-3 w-full px-4 py-3 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-light transition-colors"
//       >
//         <FaMagnifyingGlass className="w-5 h-5 " />
//         <span>Normal search</span>
//       </NavLink>
//       <NavLink
//         href="/ebay-image-search"
//         cname="flex items-center gap-3 w-full px-4 py-3 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-light transition-colors"
//       >
//         <FaImage className="w-5 h-5 " />
//         <span className="text-nowrap">eBay - Image Search</span>
//       </NavLink>
//       <NavLink
//         href="/ebay-search-by-seller"
//         cname="flex items-center gap-3 w-full px-4 py-3 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-light transition-colors"
//       >
//         <FaUserTie className="w-5 h-5 " />
//         <span className="text-nowrap">eBay - Search Items by seller</span>
//       </NavLink>
//     </div>
//   );

//   return (
//     <div
//       onMouseEnter={() => {
//         if (timeoutIdRef.current) {
//           clearTimeout(timeoutIdRef.current);
//         }
//       }}
//       onMouseLeave={() => {
//         timeoutIdRef.current = setTimeout(() => {
//           setIsOpen(false);
//         }, 500);
//       }}
//       className="relative cursor-pointer"
//     >
//       <div
//         onClick={handleClick}
//         className="flex items-center space-x-1 text-blue-600 dark:text-light hover:underline font-medium p-2 transition-colors"
//       >
//         <FaSearchDollar className="w-4 h-4" />
//         <span className="text-xs underline">Product Search</span>
//       </div>

//       {/* Desktop Dropdown */}
//       {isOpen && (
//         <div className="hidden md:flex sm:flex absolute left-1/2 -translate-x-1/2 flex-col min-w-40 w-[fit-content] mt-1 bg-white rounded-md shadow-lg py-1 z-50 dark:bg-dark dark:border-gray-700 dark:border">
//           <span
//             onClick={handleClick}
//             className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-full h-5 bg-transparent z-0"
//           />
//           <ProductSearchContent />
//         </div>
//       )}

//       {/* Mobile Modal */}
//       {isOpen && (
//         <div className="fixed sm:hidden inset-0 bg-black/50 z-50">
//           <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark rounded-t-xl shadow-xl animate-slide-up">
//             <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
//               <h2 className="text-xs font-semibold text-gray-900 dark:text-light flex items-center gap-2">
//                 <FaSearch className="w-4 h-4" />
//                 Product Search
//               </h2>
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//             <ProductSearchContent />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const CommunityDropdown = () => {
//   const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     return () => {
//       if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
//     };
//   }, []);

//   const handleClick = () => {
//     setIsOpen(!isOpen);
//   };

//   const CommunityContent = () => (
//     <div className="w-full">
//       <Link
//         href="https://discord.com/invite/6W4HkVr7bD"
//         target="_blank"
//         className="flex items-center gap-3 w-full px-4 py-3 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-light transition-colors"
//       >
//         <FaDiscord className="w-5 h-5 text-indigo-600" />
//         <span>Discord</span>
//       </Link>
//       <Link
//         href="https://www.youtube.com/@eBex-tractor"
//         target="_blank"
//         className="flex items-center gap-3 w-full px-4 py-3 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-light transition-colors"
//       >
//         <FaYoutube className="w-5 h-5 text-red-600" />
//         <span>YouTube</span>
//       </Link>
//     </div>
//   );

//   return (
//     <div
//       onMouseEnter={() => {
//         if (timeoutIdRef.current) {
//           clearTimeout(timeoutIdRef.current);
//         }
//       }}
//       onMouseLeave={() => {
//         timeoutIdRef.current = setTimeout(() => {
//           setIsOpen(false);
//         }, 500);
//       }}
//       className="relative cursor-pointer"
//     >
//       <div
//         onClick={handleClick}
//         className="flex items-center space-x-1 text-blue-600 dark:text-light hover:underline font-medium p-2 transition-colors"
//       >
//         <FaUsers className="w-4 h-4" />
//         <span className="text-xs">Community</span>
//       </div>

//       {/* Desktop Dropdown */}
//       {isOpen && (
//         <div className="hidden md:flex sm:flex absolute left-1/2 -translate-x-1/2 flex-col min-w-40 w-[fit-content] mt-1 bg-white rounded-md shadow-lg py-1 z-50 dark:bg-dark dark:border-gray-700 dark:border">
//           <span
//             onClick={handleClick}
//             className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-full h-5 bg-transparent z-0"
//           />
//           <CommunityContent />
//         </div>
//       )}

//       {/* Mobile Modal */}
//       {isOpen && (
//         <div className="fixed sm:hidden inset-0 bg-black/50 z-50">
//           <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark rounded-t-xl shadow-xl animate-slide-up">
//             <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
//               <h2 className="text-xs font-semibold text-gray-900 dark:text-light flex items-center gap-2">
//                 <FaUsers className="w-4 h-4" />
//                 search
//               </h2>
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//             <CommunityContent />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// const AccountDropdown = () => {
//   const cookies = getCookies();
//   const params = useSearchParams();
//   const pathName = usePathname();
//   const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
//   const { user, isLoading, hydrateUser, logout } = useAuthStore();

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       setIsMounted(true);
//       // hydrateUser();
//     }
//     return () => {
//       setIsOpen(false);
//       if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
//     };
//   }, []);

//   const handleClick = async () => {
//     if (!isMounted) return;
//     setIsOpen(!isOpen);
//     if (!user && cookies?.authenticatedUser) await hydrateUser();
//   };

//   // Mobile account content component
//   const AccountContent = () =>
//     typeof window !== "undefined" &&
//     isMounted && (
//       <div className="inline-block min-w-48 w-max text-nowrap">
//         {user?.email && (
//           <div className="w-full px-4 gap-2 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-800">
//             <Image
//               src={user?.profilePic || "/default_profile.png"}
//               width={40}
//               height={40}
//               alt="Profile"
//               className="w-10 h-10 rounded-full"
//             />
//             <div className="ml-2 text-left">
//               <p className="text-blue-600 dark:text-light">Hello!</p>
//               <p className="font-bold text-blue-600 dark:text-light">
//                 {user?.username || user?.email}
//               </p>
//             </div>
//           </div>
//         )}
//         {isLoading && (
//           <div className="flex items-center justify-center h-20">
//             <Spinner size={20} color="gray-700" />
//           </div>
//         )}
//         {!isLoading && user?.email && (
//           <button
//             className="w-full px-4 py-3 text-start text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-light"
//             onClick={logout}
//           >
//             Log out
//           </button>
//         )}

//         {!isLoading && !user?.email && (
//           <>
//             <Link
//               href={`/login${
//                 pathName !== "/"
//                   ? `?callback_url=${encodeURIComponent(
//                       pathName +
//                         (params.size > 0 ? "?" + params.toString() : ""),
//                     )}`
//                   : ""
//               }`}
//               className="block w-full px-4 py-3 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-light"
//             >
//               Log in/Sign up
//             </Link>
//           </>
//         )}
//         <Link
//           href="/my-saved"
//           className="block w-full px-4 py-3 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-light"
//         >
//           My Saved
//         </Link>
//       </div>
//     );

//   return (
//     <div
//       onMouseEnter={() => {
//         if (timeoutIdRef.current) {
//           clearTimeout(timeoutIdRef.current);
//         }
//       }}
//       onMouseLeave={() => {
//         timeoutIdRef.current = setTimeout(() => {
//           setIsOpen(false);
//         }, 500);
//       }}
//       className="relative cursor-pointer"
//     >
//       <div
//         onClick={handleClick}
//         className="flex space-x-1 text-blue-600 dark:text-light"
//       >
//         <FaUser className="" />
//         <span className="text-xs">Account</span>
//       </div>

//       {/* Desktop Dropdown */}
//       {isOpen && (
//         <div className="hidden md:items-center md:justify-center md:flex sm:flex absolute left-1/2 -translate-x-1/2 flex-col min-w-48 w-[fit-content] mt-1 bg-white rounded-md shadow-lg py-1 z-50 min-h-[80px] dark:bg-dark dark:border-gray-700 dark:border">
//           <span
//             onClick={handleClick}
//             className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-full h-5 bg-trasparent z-0"
//           />
//           {/* {isLoading || (user?.email !== "" && !isMounted) ? (
//             <div className="flex items-center justify-center h-20">
//               <Spinner size={20} color="gray-700" />
//             </div>
//           ) : (
//             <AccountContent />
//           )} */}

//           <AccountContent />
//         </div>
//       )}

//       {/* Mobile Modal */}
//       {isOpen && (
//         <div className="fixed sm:hidden inset-0 bg-black/50 z-50">
//           <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark rounded-t-xl shadow-xl animate-slide-up">
//             <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
//               <h2 className="text-xs font-semibold text-gray-900 dark:text-light">
//                 Account
//               </h2>
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//             {isLoading && user?.email !== "" ? (
//               <div className="flex items-center justify-center h-20">
//                 <div className="w-6 h-6 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
//               </div>
//             ) : (
//               <AccountContent />
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const pathname = usePathname();
//   // if (pathname === "/login") {
//   //   return null;
//   // }
//   return (
//     // <nav
//     //   className={`${
//     //     pathname !== "/search" && "sticky top-0 "
//     //   }!z-[9999] w-full bg-gray-100 shadow-sm border-b border-black border-opacity-20 opacity-95`}
//     // >

//     <>
//       <nav className="sticky top-0 !z-[999] w-full bg-gray-100 shadow-sm border-b border-black opacity-95 dark:bg-light-dark">
//         <div className="container mx-auto px-4 text-sm">
//           <div className="flex items-center justify-between h-16 gap-0">
//             <Link href="/" className="flex items-center">
//               <Image
//                 src="/logo-icon-transparent.png"
//                 width={25}
//                 height={25}
//                 alt="Ebextractor logo"
//                 className="mr-2"
//               />
//               <span className="text-emerald-900 font-bold text-lg hidden sm:inline dark:text-light">
//                 eBextractor
//               </span>
//             </Link>
//             {/* space-x-4 */}
//             <div className="hidden md:flex items-center ">
//               {/* <NavLink href="/search">Product Search</NavLink> */}
//               <ProductSearchDropdown />
//               {/* <NavLink href="/tools">Tools</NavLink> */}
//               {/* <NavLink href="/ebay-image-search">eBay Image Search</NavLink> */}
//               <NavLink href="/deals">Deals</NavLink>
//               <NavLink
//                 href="https://www.thefamilyflips.com/pages/visit-our-store?udm_source=ebextractor.com"
//                 target="_blank"
//               >
//                 Bin-Store
//               </NavLink>
//               {/* <NavLink href="/price-drop-notification">
//               Price-Drop Notification
//             </NavLink> */}
//               {/* <Link
//               className="text-blue-600 hover:underline font-medium p-2 rounded-full dark:text-light"
//               target="_blank"
//               href="https://app.ebextractor.com/"
//             >
//               Product research
//             </Link> */}
//               <CommunityDropdown />
//               <AccountDropdown />
//               <ToggleTheme />
//             </div>
//             <button
//               className="md:hidden lg:hidden text-gray-600 text-2xl dark:text-light"
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//             >
//               &#9776;
//               <span className="sr-only">Open menu</span>
//             </button>
//           </div>
//         </div>

//         <div
//           className={`fixed inset-y-0 right-0 z-50 w-64 bg-white p-4 transform lg:hidden md:hidden shadow-lg dark:bg-dark ${
//             isMenuOpen ? "translate-x-0" : "translate-x-full"
//           } transition-transform duration-300 ease-in-out`}
//         >
//           <button
//             className="absolute top-4 right-4 text-gray-600 text-2xl"
//             onClick={() => setIsMenuOpen(false)}
//           >
//             &times;
//             <span className="sr-only">Close menu</span>
//           </button>
//           <nav className="flex flex-col space-y-4 mt-16">
//             <NavLink href="/">Home</NavLink>
//             {/* <NavLink href="/search">Product Search</NavLink> */}
//             <ProductSearchDropdown />
//             {/* <NavLink href="/tools">Tools</NavLink> */}
//             {/* <NavLink href="/ebay-image-search">eBay Image Search</NavLink> */}
//             <NavLink
//               href="https://www.thefamilyflips.com/pages/visit-our-store"
//               target="_blank"
//             >
//               Bin-Store
//             </NavLink>

//             {/* <NavLink href="https://app.ebextractor.com">Product research</NavLink> */}
//             <CommunityDropdown />
//             <div className="flex items-center justify-start">
//               <ToggleTheme />
//               <p className="text-gray-700 dark:text-light">Toggle Theme</p>
//             </div>
//             <div className="border-t border-gray-200 pt-4">
//               <>
//                 {/* <Link
//                 href="/login"
//                 className="block py-2 text-gray-700 hover:text-gray-900 dark:text-light"
//               >
//                 Log in
//               </Link>
//               <Link
//                 href="/signup"
//                 className="block py-2 text-gray-700 hover:text-gray-900 dark:text-light"
//               >
//                 Create Account
//               </Link> */}
//                 <div className="ml-2 mt-2">
//                   <AccountDropdown />
//                 </div>
//               </>
//             </div>
//           </nav>
//         </div>
//       </nav>
//       <CategoriesNavbar />
//     </>
//   );
// };

// export default Navbar;
