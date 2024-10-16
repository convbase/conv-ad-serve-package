import { getCachedAds, getCachedWebsite } from "../cache";
import { hash } from "../config";
import { Advertisement } from "../models/advertisement";
import { getBrowserInfo, getISOCode } from "../utils";
import { renderAdDisplayByType, attachAdClickListener } from "./ad-utils";
import { Website } from "../models/website";
import { adImpression } from "../services/ad-service";

/** Variable to prevent repeated GET of ads */
var isCollectingAds: boolean = false;

/** Function to detect DOM changes */
const mutationObserver = async function (mutationsList: any) {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      // console.log("A child node has been added or removed.");
      await collectAndLoadAds();
    } else if (mutation.type === "attributes") {
      // console.log(
      //   "The " + mutation.attributeName + " attribute was modified."
      // );
    }
  }
};

const observer = new MutationObserver(mutationObserver);
const targetNode = document.body;
const config = { attributes: true, childList: true, subtree: true };

/** Collects website and user information and loads ads */
export async function collectAndLoadAds() {
  if (isCollectingAds) return; // Prevent re-entry if already running
  isCollectingAds = true; // Set the flag

  let browserInfo = getBrowserInfo();


  getISOCode(async function (countryCode: string) {
    let userData: any = {
      browserInfo: browserInfo,
      isoCode: countryCode,
      hash: hash,
    };

    observer.disconnect(); // Temporarily disconnect observer
    await getCachedWebsite(); // Get cached website
    await loadAds(userData); // Load ads
    observer.observe(targetNode, config); // Reconnect observer


    isCollectingAds = false; // Reset the flag after completion
  });
}

/** Loads ads based on site settings and available ad containers */
export async function loadAds(userData: any) {
  let adContainers = document.querySelectorAll("[data-ad-container]");

  if (adContainers.length > 0) {
    const website: Website = await getCachedWebsite(); // Get cached website
    
    const cachedAds = await getCachedAds(userData);

    if(cachedAds) {
      for (let i = 0, iCached = 0; i < adContainers.length; i++, iCached++) {
        let ad: Advertisement = cachedAds[iCached];
        const adContainer = adContainers[i];
        if (adContainer) {
          if (!ad) {
            iCached = 0;
            ad = cachedAds[iCached];
          }

          const adInnerHTML = renderAdDisplayByType(ad.ad_type, ad);
          adContainer.innerHTML = adInnerHTML;
          attachAdClickListener(adContainer, ad);
          adImpression(ad.id, website.id);
        } else {
          console.error(`No ad container found at index ${i}`);
        }
      }
    }
  }
}
