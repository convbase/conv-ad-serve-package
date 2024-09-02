// config.js
export const adServerUrl = "http://127.0.0.1:5000";
export const CACHE_KEY = "cachedAds";
export const CACHE_TIMESTAMP_KEY = "cachedAdsTimestamp";
export const CACHE_EXPIRATION_MS = 3600000; // 1 hour
export const WEBSITE_CACHE_KEY = "cachedWebsite";
export const WEBSITE_CACHE_TIMESTAMP_KEY = "cachedWebsiteTimestamp";
export const WEBSITE_CACHE_EXPIRATION_MS = 3600000; // 1 hour

// Atributos do script atual
export let script = document.getElementById('ConvbaseTag');
export let hash = script?.getAttribute('data-hash');
export const adContainerId = script?.getAttribute('data-ad-container-id');
export let isCollectingAds = false;

export function setIsCollectingAds(bool: boolean){
    isCollectingAds = bool;
}
export function getHash(){
    return document.currentScript?.getAttribute('data-hash');
}
export function getAdContainerId(){
    return document.currentScript?.getAttribute('data-ad-container-id');
}