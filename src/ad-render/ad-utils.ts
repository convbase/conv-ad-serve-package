import { getCachedWebsite, setCachedWebsite } from "../cache";
import { Advertisement } from "../models/advertisement";
import { adClick } from "../services/ad-service";
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

/** Receives an HTML element as a parameter and sets the font and background colors based on the detected contrast */
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

/** Detects whether the website is dark or light */
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

/** Implement a Listener for ad clicks */
export function attachAdClickListener(adContainer: Element, ad: Advertisement) {
  // TODO poder aceitar mais que um link, pois vários produtos poderão ser exibidos
  const adLink = adContainer.getElementsByTagName('a')[0];
  if(adLink){
    adLink.addEventListener("click", async (event) => {
      const website = await getCachedWebsite(); // Obtenha o website armazenado em cache

      adClick(ad, website.id);
    });
  }
}
