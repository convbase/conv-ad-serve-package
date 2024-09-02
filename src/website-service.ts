// websiteService.js

import { setCachedWebsite } from "./cache";
import { adServerUrl } from "./config";
import { WebsiteStatistics } from "./models/website-statistics";

export async function getWebsiteByURL(url: string) {
  const response = await fetch(
    `${adServerUrl}/get-website-by-url?url=${encodeURIComponent(
      url
    )}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (response.ok) {
    const result = await response.json();
    console.log(result);
    setCachedWebsite(result);
    return result.data;
  } else {
    console.error("Failed to fetch website by URL");
    return null;
  }
}

export async function getWebsiteStatisticsByWebsiteIdAndDate(websiteId: number, date: string) {
  const response = await fetch(
    `${adServerUrl}/get-website-statistics-by-website-id-and-date?websiteId=${encodeURIComponent(
      websiteId
    )}&date=${encodeURIComponent(date)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (response.ok) {
    const result = await response.json();
    return result.data;
  } else {
    console.error(
      "Failed to fetch website statistics by website ID and date"
    );
    return null;
  }
}

export async function updateWebsiteStatistics(websiteStatistics: WebsiteStatistics) {
  const response = await fetch(
    adServerUrl + "/update-website-statistics",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(websiteStatistics),
    }
  );
  if (!response.ok) {
    console.error("Failed to update website statistics");
  }
}

export async function saveWebsiteStatistics(websiteStatistics: WebsiteStatistics) {
  const response = await fetch(
    adServerUrl + "/save-website-statistics",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(websiteStatistics),
    }
  );
  if (!response.ok) {
    console.error("Failed to save website statistics");
  }
}
