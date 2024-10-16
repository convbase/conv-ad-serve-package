import { CACHE_KEY, CACHE_TIMESTAMP_KEY, CACHE_EXPIRATION_MS, WEBSITE_CACHE_KEY, WEBSITE_CACHE_TIMESTAMP_KEY, WEBSITE_CACHE_EXPIRATION_MS } from "./config";
import { Advertisement } from "./models/advertisement";
import { Website } from "./models/website";
import { getAdsByUser } from "./services/ad-service";
import { getWebsiteByURL } from "./services/website-service";

/** Return cached ads or use GET to store them */
export async function getCachedAds(userData: any) {
  const cachedAds = localStorage.getItem(CACHE_KEY);
  const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

  if (cachedAds && cacheTimestamp) {
    const now = Date.now();
    const cacheAge = now - Number(cacheTimestamp);
    if (cacheAge < CACHE_EXPIRATION_MS) {
      return JSON.parse(cachedAds);
    }
  } else {
    return await getAdsByUser(userData); 
  }

  return null;
}

/** Caches the Ads in LocalStorage */
export function setCachedAds(ads: Advertisement[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(ads));
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
}

/** Returns the cached website or does GET to store it */
export async function getCachedWebsite() {
  const cachedWebsite = localStorage.getItem(WEBSITE_CACHE_KEY);
  const cacheTimestamp = localStorage.getItem(WEBSITE_CACHE_TIMESTAMP_KEY);

  if (cachedWebsite && cacheTimestamp) {
    const now = Date.now();
    const cacheAge = now - Number(cacheTimestamp);
    if (cacheAge < WEBSITE_CACHE_EXPIRATION_MS) {
      return JSON.parse(cachedWebsite);
    }
  } else {
    return await getWebsiteByURL(window.location.origin);
  }

  return null;
}

/** Caches the website in LocalStorage */
export function setCachedWebsite(cachedWebsite: Website) {
  localStorage.setItem(WEBSITE_CACHE_KEY, JSON.stringify(cachedWebsite));
  localStorage.setItem(WEBSITE_CACHE_TIMESTAMP_KEY, Date.now().toString());
}
