import { getCachedWebsite, setCachedWebsite } from "../cache";
import { adServerUrl } from "../config";
import { Advertisement } from "../models/advertisement";
import { getWebsiteByURL } from "../website-service";
import { createClassicAd } from "./ad-types/classic-ad";
import { createFixedAd } from "./ad-types/fixed-ad";
import { createPopup } from "./ad-types/pop-up";

/** Renders a specific `<div>` for each Ad Type */
export function renderAdDisplayByType(adType: string, ad: Advertisement){
  switch (adType) {
    case 'classic_banners':
      return createClassicAd(ad);
    case 'pop_under':
      createPopup(ad);
    return ''; // TODO Remover retorno (Pop Up e Header/Footer terão componente próprio e serão habilitados sem precisar configurar divs)
    case 'header_banner':
      createFixedAd('top', ad);
    return '';
    case 'sticky_banner':
      createFixedAd('bottom', ad);
    return '';
    // case 'native_ads': // TODO Anúncios que se adaptem automaticamente ao estilo do site 
    //   createNativeAd(ad);
    //   return '';
    default:
      return createClassicAd(ad);
  }
}

export function setContrastingColors(element: HTMLElement) {
  const bodyBackground = getComputedStyle(document.body).backgroundColor;
  
  const darkBackground = checkBackgroundDark(bodyBackground);
  
  if (darkBackground) {
    element.style.color = '#000000'
    element.style.backgroundColor = '#f5f5f5'
  } else {
    element.style.color = '#FFFFFF'
    element.style.backgroundColor = '#1c1c1c'
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

/** Faz requisição para registrar o clique no Anúncio */
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
