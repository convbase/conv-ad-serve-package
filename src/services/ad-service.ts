import { setCachedAds } from "../cache";
import { adServerUrl } from "../config";
import { Advertisement } from "../models/advertisement";

/** Makes a GET of ads according to the information collected from the user */
export async function getAdsByUser(userData: any) {
  try {
    const response = await fetch(adServerUrl + "/get-ad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const userAds = await response.json();
    setCachedAds(userAds);
    return userAds;
  } catch (error) {
    console.error("Failed to load ad:", error);
    return null;
  }
}

/** Makes the request to count ad impressions and views made by the website */
export async function adImpression(adId: any, websiteId: any){
  try {
    const response = await fetch(
      adServerUrl + "/ad-impression",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertisement_id: adId,
          website_id: websiteId,
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
}

/** Make a request to register the click on the Ad */
export async function adClick(ad: Advertisement, websiteId: number){
  try {
    const response = await fetch(
      adServerUrl + "/ad-click",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad: ad,
          website_id: websiteId,
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
}

