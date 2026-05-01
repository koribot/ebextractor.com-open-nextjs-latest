export const parseAmazonSearchResult = (
  htmlString: string,
  origin?: string | null 
) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const resultElements = doc.querySelectorAll(
    'div[data-component-type="s-search-result"]'
  );
  const results = Array.from(resultElements).map((result) => {
    const asin = result.getAttribute("data-asin") || "";
    const imgElement = result.querySelector("img.s-image");
    const imgSrc = imgElement ? imgElement.getAttribute("src") || "" : "";
    const priceElement = result.querySelector(
      "span.a-price > span.a-offscreen"
    );
    const price = priceElement
      ? priceElement.textContent || ""
      : "Price not available";
    const aElement =
      result.querySelector('[data-cy="title-recipe"] > a') ||
      result.querySelector(
        "a.a-link-normal.s-line-clamp-2.s-link-style.a-text-normal"
      ) ||
      result.querySelector(
        "a.a-link-normal.s-line-clamp-4.s-link-style.a-text-normal"
      );

    const typicalPriceOriginalPriceElement = result.querySelector(
      "a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal"
    );
    // const href = `/dp/${asin}?&linkCode=ll1&tag=ebextractor-20&linkId=988d38553f73c7a581458a19617d4a26&language=en_US&ref_=as_li_ss_tl`;
    // const href = `/dp/${asin}/ref=nosim?tag=ebextractor0d-20&asc_refurl=${encodeURIComponent(
    //   window.location.href
    // )}`;
    const href = `${
      origin ? origin : "/"
    }dp/${asin}/ref=nosim?tag=ebextractor0d-20`;
    const title = aElement ? aElement.textContent : "";
    const typicalPrice = typicalPriceOriginalPriceElement
      ? typicalPriceOriginalPriceElement.textContent || ""
      : "";
    return { img: imgSrc, title, asin, href, price, typicalPrice };
  });
  return results;
};
