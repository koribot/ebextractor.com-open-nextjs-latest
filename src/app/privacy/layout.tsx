import { Metadata } from "next";
import MainLayout from "../layout/MainLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | eBextractor",
  metadataBase: new URL("https://www.ebextractor.com"),
  openGraph: {
    images: ["/logo-icon-transparent.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
    },
  },
  alternates: {
    canonical: "https://www.ebextractor.com/privacy",
  },
  description: `At Ebextractor, we prioritize your privacy. 
  We only collect essential information for account creation and analytics.`,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainLayout>
      {children}
      {/* <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Privacy Policy
        </h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Information Collection
            </h2>
            <p className="text-gray-600 mb-4">
              At Ebextractor, we prioritize your privacy. We do not track your
              activity while using our website. The only personal information
              we collect is during account creation, which includes:
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              <li>Email address</li>
              <li>Username</li>
              <li>Password {`(encrypted)`}</li>
            </ul>
            <p className="text-gray-600 mb-6">
              This information is securely stored in our database and is used
              solely for account management purposes.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Data Security
            </h2>
            <p className="text-gray-600 mb-6">
              We implement industry-standard security measures to protect your
              personal information from unauthorized access, alteration,
              disclosure, or destruction.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Third-Party Services
            </h2>
            <p className="text-gray-600 mb-6">
              We do not share your personal information with any third parties
              unless required by law.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Changes to This Policy
            </h2>
            <p className="text-gray-600 mb-6">
              We may update our Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page.
            </p>

            <p className="text-sm text-gray-500 mt-8">
              Last updated: 12/25/24
            </p>
          </div>
        </div>
        <div className="mt-8 text-center space-y-4 flex flex-col">
          <a
            href={`/affiliate-disclosure`}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
          >
            View Affiliate Disclosure
          </a>
          <a
            href={`/terms-and-conditions`}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
          >
            View Terms and Conditions
          </a>
        </div>
      </div>
    </div> */}
    </MainLayout>
  );
}
