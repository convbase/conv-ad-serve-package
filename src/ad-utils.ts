// adUtils.js

import { getCachedWebsite, setCachedWebsite } from "./cache";
import { adServerUrl } from "./config";
import { Advertisement } from "./models/advertisement";
import { getWebsiteByURL } from "./website-service";

export function getAdHtml(ad: Advertisement) {
  if (ad.ad_format === "image") {
    return `<a href="${ad.url}" target="_blank"><img src="${ad.data}" style="width: 100%; height: 100%; object-fit: contain;" alt="${ad.title}"></a>`;
  } else if (ad.ad_format === "text") {
    return `<a href="${ad.url}" target="_blank" style="display: block; padding: 10px; text-decoration: none; color: black; border: 1px solid #ccc; border-radius: 5px;"><h3>${ad.title}</h3><p>${ad.data}</p></a>`;
  } else if (ad.ad_format === "video") {
    return `<video controls style="width: 100%; height: 100%; object-fit: contain;"><source src="${ad.data}" type="video/mp4">Your browser does not support the video tag.</video>`;
  }
  return "";
}

export function attachAdClickListener(adContainer: Element, ad: Advertisement) {
  adContainer.addEventListener("click", async (event) => {
    event.preventDefault();
    let website = getCachedWebsite(); // Obtenha o website armazenado em cache
    if (!website) {
      const currentUrl = new URL(window.location.href).origin;
      website = await getWebsiteByURL(currentUrl);
      if (website) {
        setCachedWebsite(website); // Armazene o website em cache
      } else {
        console.error("Website not found");
        return;
      }
    }
    try {
      const response = await fetch(
        adServerUrl + "/ad-click",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ad: ad,
            website_id: website.id,
          }),
        }
      );
      const result = await response.json();
      if (result.error) {
        console.error(`Error updating ad metrics: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to update ad metrics:", error);
    }
  });
}
