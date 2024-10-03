import { getCachedWebsite, setCachedWebsite } from "../cache";
import { adServerUrl } from "../config";
import { Advertisement } from "../models/advertisement";
import { getWebsiteByURL } from "../website-service";
import { createFixedAd } from "./fixed-ad";
import { createPopup } from "./pop-up";

/** Renders a specific `<div>` for each Ad Type */
export function renderAdDisplayByType(adType: string, ad: Advertisement){
  const content = setAdContentByFormat(ad);
  const contrastColors = setContrastingColors();
  
  switch (adType) {
    case 'classic_banners':
      return `
        <div class="ad-classic-banner">
          ${content}
        </div>`;
      
    case 'native_ads':
      return `
        <div class="native-ads">
          ${content}
        </div>`;

    case 'pop_under':
      createPopup(content);
      return ''; // TODO Remover retorno (Pop Up e Header/Footer terão componente próprio e serão habilitados sem precisar configurar divs)
    case 'header_banner':
      createFixedAd('top', content);
      return '';
    case 'sticky_banner':
      createFixedAd('bottom', content);
      return '';
    default:
      return `<div class="ad-classic-banner"> ${content} </div>`;
  }
}

/** Defines the Ad Content according to the registered format */
export function setAdContentByFormat(ad: Advertisement) { // TODO implement VIDEO and RICH-MEDIA formats
  if (ad.ad_format === "image") {
    return `<a href="${ad.url}" target="_blank" style="display: contents;"><img src="${ad.data}" style="margin: auto; height: 100%; object-fit: contain;" alt="${ad.title}"></a>`;
  } else if (ad.ad_format === "rich_media") {
    return `<a href="${ad.url}" target="_blank" style="display: contents; padding: 10px; text-decoration: none; color: black; border: 1px solid #ccc; border-radius: 5px;"><h3>${ad.title}</h3><p>${ad.data}</p></a>`;
  } else if (ad.ad_format === "video") {
    return `<video controls style="width: 100%; height: 100%; object-fit: contain;"><source src="${ad.data}" type="video/mp4">Your browser does not support the video tag.</video>`;
  }
  return ``;
}

function setContrastingColors() {
  const bodyBackground = getComputedStyle(document.body).backgroundColor;
  
  const darkBackground = checkBackgroundDark(bodyBackground);
  
  if (darkBackground) {
    return {backgroundColor: '#f5f5f5', color: '#000000'};
  } else {
    return {backgroundColor: '#1c1c1c', color: '#FFFFFF'};
  }
}

function checkBackgroundDark(color: string): boolean {
  const rgb = color.match(/\d+/g);
  if (!rgb) return false;
  const r = parseInt(rgb[0], 10);
  const g = parseInt(rgb[1], 10);
  const b = parseInt(rgb[2], 10);
  
  // Using the luminance formula to check for brightness
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 150; // If luminance is less than 150, consider it dark
}

export function attachAdClickListener(adContainer: Element, ad: Advertisement) {
  // TODO poder aceitar mais que um link, pois vários produtos poderão ser exibidos
  const adLink = adContainer.getElementsByTagName('a')[0];
  if(adLink){
    adLink.addEventListener("click", async (event) => {
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
}
