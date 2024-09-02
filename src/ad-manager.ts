// adManager.js

import { getAdHtml, attachAdClickListener } from "./ad-utils";
import { getCachedAds, getCachedWebsite, setCachedAds, setCachedWebsite } from "./cache";
import { adServerUrl, getHash, hash, isCollectingAds, script, setIsCollectingAds } from "./config";
import { getBrowserInfo, getISOCode } from "./utils";
import { getWebsiteByURL, getWebsiteStatisticsByWebsiteIdAndDate, saveWebsiteStatistics, updateWebsiteStatistics } from "./website-service";

const callback = function (mutationsList: any) {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      console.log("A child node has been added or removed.");
      collectAndLoadAd();
    } else if (mutation.type === "attributes") {
      console.log(
        "The " + mutation.attributeName + " attribute was modified."
      );
    }
  }
};
const observer = new MutationObserver(callback);
const targetNode = document.body;
const config = { attributes: true, childList: true, subtree: true };

export async function loadAd(userData: any) {
  let adContainers = document.querySelectorAll("[data-ad-container]");
  if (adContainers.length > 0) {
    let website = getCachedWebsite(); // Get cached website
    
    if (!website) {
      const currentUrl = new URL(window.location.href).origin;
      website = await getWebsiteByURL(currentUrl);
      if (website) {
        setCachedWebsite(website); // Cache the website
      } else {
        console.error("Website not found");
        return;
      }
    }
    
    if (website) {
      let adData = getCachedAds();
      if (!adData) {
        try {
          const response = await fetch(adServerUrl + "/get-ad", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });
          adData = await response.json();
          setCachedAds(adData);
        } catch (error) {
          console.error("Failed to load ad:", error);
        }
      }
      if (adData) {
        let numberOfAdsLoaded = 0;
        for (let i = 0, iCached = 0; i < adContainers.length; i++, iCached++) {
          let ad = adData[iCached];
          const adContainer = adContainers[i];
          if (adContainer) {
            if (!ad) {
              iCached = 0;
              ad = adData[iCached];
            }
            const html_ad = getAdHtml(ad);
            adContainer.innerHTML = html_ad;
            numberOfAdsLoaded++;
            try {
              const response = await fetch(
                adServerUrl + "/ad-impression",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    advertisement_id: ad.id,
                    website_id: website.id,
                  }),
                }
              );
              const result = await response.json();
              if (result.error) {
                console.error(
                  `Error updating ad metrics: ${result.error}`
                );
              }
            } catch (error) {
              console.error("Failed to update ad metrics:", error);
            }
            attachAdClickListener(adContainer, ad);
          } else {
            console.error(`No ad container found at index ${i}`);
          }
        }
        return numberOfAdsLoaded;
      }
    }
  }
}

export async function collectAndLoadAd() {
  // console.log('DOCUMENT',  document.getElementById('ConvbaseTag'))
  if (isCollectingAds) return; // Prevent re-entry if already running
  setIsCollectingAds(true); // Set the flag

  let browserInfo = getBrowserInfo();
  let numOfAds;


  getISOCode(async function (countryCode: string) {
    let userData: any = {
      browserInfo: browserInfo,
      isoCode: countryCode,
      hash: hash,
    };

    observer.disconnect(); // Temporarily disconnect observer
    numOfAds = await loadAd(userData); // Load ads
    observer.observe(targetNode, config); // Reconnect observer

    let website = getCachedWebsite(); // Get cached website
    
    if (!website) {
      const websiteUrl = new URL(window.location.href).origin;
      website = await getWebsiteByURL(websiteUrl);
      if (website) {
        setCachedWebsite(website); // Cache the website
      } else {
        console.error("Website not found");
        setIsCollectingAds(false); // Reset the flag after completion
        return;
      }
    }

    const websiteId = website.id;
    const profile_id = website.profile_id;
    const date = new Date().toISOString().split("T")[0];
    const websiteStatistics =
      await getWebsiteStatisticsByWebsiteIdAndDate(websiteId, date);
    if (websiteStatistics) {
      websiteStatistics.page_views += 1;
      if (numOfAds && numOfAds > 0) {
        websiteStatistics.ad_delivered += numOfAds;
      }
      await updateWebsiteStatistics(websiteStatistics);
    } else {
      const newWebsiteStatistics: any = {
        id: null,
        website_id: websiteId,
        profile_id: profile_id,
        date: date,
        page_views: 1,
        ad_clicks: 0,
        ad_delivered: 0,
        bounce_rate: 0.0,
      };
      await saveWebsiteStatistics(newWebsiteStatistics);
    }

    setIsCollectingAds(false); // Reset the flag after completion
  });
}
