// cache.js

import { CACHE_KEY, CACHE_TIMESTAMP_KEY, CACHE_EXPIRATION_MS, WEBSITE_CACHE_KEY, WEBSITE_CACHE_TIMESTAMP_KEY, WEBSITE_CACHE_EXPIRATION_MS } from "./config";
import { Advertisement } from "./models/advertisement";
import { CachedWebsite } from "./models/cached-website";

export function getCachedAds() {
  const cachedAds = localStorage.getItem(CACHE_KEY);
  const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (cachedAds && cacheTimestamp) {
    const now = Date.now();
    const cacheAge = now - Number(cacheTimestamp);
    if (cacheAge < CACHE_EXPIRATION_MS) {
      return JSON.parse(cachedAds);
    }
  }
  return null;
}

export function setCachedAds(ads: Advertisement[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(ads));
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
}

export function getCachedWebsite() {
  const cachedWebsite = localStorage.getItem(WEBSITE_CACHE_KEY);
  const cacheTimestamp = localStorage.getItem(WEBSITE_CACHE_TIMESTAMP_KEY);
  if (cachedWebsite && cacheTimestamp) {
    const now = Date.now();
    const cacheAge = now - Number(cacheTimestamp);
    if (cacheAge < WEBSITE_CACHE_EXPIRATION_MS) {
      return JSON.parse(cachedWebsite);
    }
  }
  return null;
}

export function setCachedWebsite(cachedWebsite: CachedWebsite) {
  localStorage.setItem(WEBSITE_CACHE_KEY, JSON.stringify(cachedWebsite));
  localStorage.setItem(WEBSITE_CACHE_TIMESTAMP_KEY, Date.now().toString());
}
