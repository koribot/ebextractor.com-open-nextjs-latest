export const dynamic = "force-dynamic";

import { Metadata, ResolvingMetadata } from "next";
import { RedirectHandler } from "../components/amz/RedirectHandler";
import Image from "next/image";
import Link from "next/link";
import { FaMoneyBillWave } from "react-icons/fa";
import React, { Suspense } from "react";
import AffliateDisclosure from "../components/affilate-disclosure/AffliateDisclosure";
import ImagePreview from "../components/common/ui/ImagePreview";
import MainLayout from "../layout/MainLayout";
import SpinnerFallback from "../components/common/ui/fallbacks/SpinnerFallback";
import ShowSpinnerFallBackWhenComponentNotMounted from "../components/common/ui/fallbacks/ShowSpinnerFallBackWhenComponentNotMounted";
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const images = resolvedSearchParams.img;
  const id = resolvedSearchParams.asin || "";
  const itemName = resolvedSearchParams.title || "View Details - Amazon";
  const itmid = `${id as string}`;
  return {
    metadataBase: new URL("https://www.ebextractor.com"),
    openGraph: {
      images: images,
    },
    title: itemName + " | " + itmid,
    description: (itemName as string) + itmid,
  };
}

export default async function Page({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const shouldRedirect =
    resolvedSearchParams.mode === "amazon-search" &&
    !!resolvedSearchParams.title &&
    !!resolvedSearchParams.origin;
  const title = Array.isArray(resolvedSearchParams.title)
    ? resolvedSearchParams.title.join(" ")
    : resolvedSearchParams.title || "";
  const price = (resolvedSearchParams.price as string) || "";
  const defaultSite = (resolvedSearchParams.site as string) || "amazon.com";
  const asin = (resolvedSearchParams.asin as string) || "";
  const img = (resolvedSearchParams.img as string) || "";

  return (
    <MainLayout>
      <div className="min-h-[80dvh] flex items-center justify-center flex-col gap-4 py-12 px-6 dark:bg-light-gray">
        {shouldRedirect ? (
          <RedirectHandler
            origin={resolvedSearchParams.origin as string}
            title={title}
            img={img}
          />
        ) : title === "" || price === "" || img === "" || asin === "" ? (
          <h1 className="text-2xl font-bold dark:text-main-white">
            Page not found -{" "}
            <Link className="text-greenish underline" href="/" prefetch={false}>
              Go home Instead
            </Link>
          </h1>
        ) : (
          <div className="max-w-7xl">
            <div className="flex flex-col items-center justify-center lg:flex-row gap-12 bg-main-white min-h-[60dvh] p-8 rounded-lg shadow-md dark:bg-light-dark dark:border dark:border-gray-700">
              {img && (
                <div className="flex flex-col basis-2/3">
                  <div className="flex justify-center mb-4 relative">
                    <ImagePreview
                      src={img}
                      alt={title}
                      width={800}
                      height={800}
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col md:items-start space-y-4 basis-2/3">
                <h1 className="text-sm md:text-4xl font-bold text-gray-800 dark:text-light">
                  {title && title}
                </h1>
                {price && (
                  <p className="text-sm md:text-4xl font-semibold text-green-600">
                    <FaMoneyBillWave className="inline mr-2" />
                    {price}
                  </p>
                )}
                {asin && (
                  <>
                    <a
                      href={`https://${defaultSite}/dp/${asin}?&linkCode=ll1&tag=ebextractor-20&linkId=988d38553f73c7a581458a19617d4a26&language=en_US&ref_=as_li_ss_tl`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-center font-bold hover:bg-blue-700 transition"
                    >
                      Buy Now on Amazon
                    </a>
                    <a
                      href={`https://camelcamelcamel.com/search?sq=${asin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 w-full bg-main-bg text-white py-3 px-6 rounded-lg text-center font-bold hover:bg-gray-900 transition"
                    >
                      View Price History
                    </a>
                  </>
                )}
              </div>
            </div>
            <AffliateDisclosure />
            {asin && (
              <h1 className="text-center text-4xl text-main-white p-2 bg-gray-900">
                ASIN: {asin}
              </h1>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
