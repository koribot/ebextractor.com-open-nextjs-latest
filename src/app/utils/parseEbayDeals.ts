import { EbayItemDealsDetails } from "../components/home/types";

export const parseEbayDeals = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  // Select all parent divs with the specified class
  const elements = doc.querySelectorAll(
    "div.ebayui-dne-featured-card"
  ) as NodeListOf<HTMLElement>;
  const itemDetailsArray: EbayItemDealsDetails[] = [];

  elements.forEach((parentDiv) => {
    // Get all child divs with class 'dne-itemtile'
    const childDivs = parentDiv.querySelectorAll(
      "div.dne-itemtile"
    ) as NodeListOf<HTMLElement>;

    childDivs.forEach((childDiv) => {
      // item link
      const aTag = childDiv.querySelector("a");
      const aTagHref = aTag?.href || "";

      // Extract the title
      const titleElement = childDiv.querySelector(
        'h3.dne-itemtile-title > span > span[itemprop="name"]'
      );
      const title = titleElement
        ? titleElement.textContent?.trim() || ""
        : "";

      // Extract the price
      const priceElement = childDiv.querySelector('span[itemprop="price"]');
      const price = priceElement
        ? priceElement.textContent?.trim() || "Check on Ebay"
        : "Check on Ebay";
      const previousPriceContainer = childDiv.querySelector(
        "div.dne-itemtile-original-price"
      );
      const prevPriceEl =
        previousPriceContainer?.querySelector("span.itemtile-price-strikethrough")
      const prevPriceSaleOff = previousPriceContainer?.querySelector("span.itemtile-price-bold")
      const prevPrice = `${prevPriceEl?.textContent?.trim() || " "}|${prevPriceSaleOff?.textContent?.trim() || " "}` || ""

      // Extract the image URL
      const imageContainer = childDiv.querySelector("div.slashui-image-cntr");
      const imageElement =
        imageContainer && imageContainer.querySelector("img");
      const image = imageElement
        ? imageElement.getAttribute("data-config-src") || imageElement.src
        : "";

      // Add the extracted details to the array
      itemDetailsArray.push({
        title,
        price,
        prevPrice,
        image,
        href: aTagHref,
      });
    });
  });
  return itemDetailsArray
};