import { Advertisement } from "../../models/advertisement";
import { setContrastingColors } from "../ad-utils";

export function createClassicAd(ad: Advertisement){
    return createClassicContent(ad);
}

/** Defines the Ad Content according to the registered format */
export function createClassicContent(ad: Advertisement) { // TODO implement VIDEO and RICH-MEDIA formats
  if (ad.ad_format === "image") {
    return `<a href="${ad.url}" target="_blank" style="display: contents;"><img src="${ad.data}" style="margin: auto; height: 100%; object-fit: contain;" alt="${ad.title}"></a>`;
  } else if (ad.ad_format === "rich_media") {
    return `<a href="${ad.url}" target="_blank" style="display: contents; padding: 10px; text-decoration: none; color: black; border: 1px solid #ccc; border-radius: 5px;"><h3>${ad.title}</h3><p>${ad.data}</p></a>`;
  } else if (ad.ad_format === "video") {
    return `<video controls style="width: 100%; height: 100%; object-fit: contain;"><source src="${ad.data}" type="video/mp4">Your browser does not support the video tag.</video>`;
  }
  return ``;
}