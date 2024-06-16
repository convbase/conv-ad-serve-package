  (function() {
    var script = document.currentScript;
    var adServerUrl = "http://127.0.0.1:5000";
    var adContainerId = script.getAttribute('data-ad-container-id');
    var hash = script.getAttribute('data-hash');
    const CACHE_KEY = 'cachedAds';
    const CACHE_TIMESTAMP_KEY = 'cachedAdsTimestamp';
    const CACHE_EXPIRATION_MS = 3600000; // 1 hour

    function getBrowserInfo() {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        screenWidth: screen.width,
        screenHeight: screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }

    function getISOCode(callback) {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://api.ipgeolocation.io/ipgeo?apiKey=b241516d57d94b4ca206ed8656a81155",
        true
      );
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            callback(response.country_code2); // Assuming the API returns the country code in this field
          } else {
            console.error(
              "Failed to get ISO code:",
              xhr.status,
              xhr.statusText
            );
            callback(null);
          }
        }
      };
      xhr.send();
    }

    function getCachedAds() {
      const cachedAds = localStorage.getItem(CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (cachedAds && cacheTimestamp) {
        const now = Date.now();
        const cacheAge = now - cacheTimestamp;
        if (cacheAge < CACHE_EXPIRATION_MS) {
          return JSON.parse(cachedAds);
        }
      }
      return null;
    }

    function setCachedAds(ads) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(ads));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now());
    }

    async function loadAd(userData) {
      let adContainers = document.querySelectorAll("[data-ad-container]");
      if (adContainers.length > 0) {
        const currentUrl = new URL(window.location.href).origin;
        const website = await getWebsiteByURL(currentUrl);
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
            for (let i = 0; i < adContainers.length; i++) {
              let ad = adData[i];
              const adContainer = adContainers[i];
              if (adContainer) {
                if (!ad) {
                  ad = adData[i - 1];
                }
                const html_ad = getAdHtml(ad);
                adContainer.innerHTML = html_ad;
                ad.adId = ad.id;
                numberOfAdsLoaded++;
                try {
                  const response = await fetch(
                    adServerUrl + "/ad-impression",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        advertisement_id: ad.adId,
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

    async function collectAndLoadAd() {
      let browserInfo = getBrowserInfo();
      let numOfAds;

      getISOCode(async function (countryCode) {
        let userData = {
          browserInfo: browserInfo,
          isoCode: countryCode,
          hash: hash,
        };

        observer.disconnect(); // Temporarily disconnect observer
        numOfAds = await loadAd(userData); // Load ads
        observer.observe(targetNode, config); // Reconnect observer

        const websiteUrl = new URL(window.location.href).origin;
        const website = await getWebsiteByURL(websiteUrl);
        if (website) {
          const websiteId = website.id;
          const profile_id = website.profile_id;
          const date = new Date().toISOString().split("T")[0];
          const websiteStatistics = await getWebsiteStatisticsByWebsiteIdAndDate(websiteId, date);
          if (websiteStatistics) {
            websiteStatistics.page_views += 1;
            if (numOfAds > 0) {
              websiteStatistics.ad_delivered += numOfAds;
            }
            await updateWebsiteStatistics(websiteStatistics);
          } else {
            const newWebsiteStatistics = {
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
        } else {
          console.error("Website not found");
        }
      });
    }

    function getAdHtml(ad) {
      if (ad.ad_format === "image") {
        return `<a href="${ad.url}" target="_blank"><img src="${ad.data}" style="width: 100%; height: 100%; object-fit: contain;" alt="${ad.title}"></a>`;
      } else if (ad.ad_format === "text") {
        return `<a href="${ad.url}">${ad.title}</a>`;
      } else if (ad.ad_format === "video") {
        return `
  <div>
    <video width="100%" height="100%" controls>
      <source src="${ad.data}" type="video/mp4">
      Your browser does not support the video tag.
    </video>
    <a href="${ad.url}">Learn more</a>
  </div>
`;
      } else if (ad.ad_format === "popup") {
        return `
  <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
    <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd;">
      <h2>${ad.title}</h2>
      <p>${ad.description}</p>
      <a href="${ad.url}">Learn more</a>
      <button onclick="this.parentNode.parentNode.removeChild(this.parentNode);">Close</button>
    </div>
  </div>
`;
      } else if (ad.ad_format === "rich_media") {
        return `
  <div>
    <div style="background-image: url(${ad.data}); background-size: cover; height: 300px; width: 300px;">
      <h2>${ad.title}</h2>
      <p>${ad.description}</p>
      <a href="${ad.url}">Learn more</a>
    </div>
  </div>
`;
      } else {
        return `<p>Unknown ad format: ${ad.ad_format}</p>`;
      }
    }

    function attachAdClickListener(adContainer, adData) {
      adContainer.addEventListener("click", function (event) {
        let adClickData = {
          eventType: "adClick",
          ad: adData,
          clickedElement: event.target.tagName,
          timestamp: new Date().toISOString(),
        };
        sendAdClickData(adClickData);
      });
    }

    function sendAdClickData(adClickData) {
      const currentUrl = new URL(window.location.href).origin;
      getWebsiteByURL(currentUrl).then((website) => {
        if (website) {
          adClickData.website_id = website.id;
          fetch(adServerUrl + "/ad-click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(adClickData),
          })
            .then((response) => response.json())
            .catch((error) =>
              console.error("Failed to send ad click data:", error)
            );
        } else {
          console.error("Failed to retrieve website ID:", currentUrl);
        }
      });
    }

    async function getWebsiteByURL(url) {
      try {
        const response = await fetch(
          `${adServerUrl}/get-website-by-url?url=${encodeURIComponent(
            url
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const website = await response.json();
        return website;
      } catch (error) {
        console.error("Failed to get website:", error);
      }
    }

    async function getWebsiteStatisticsByWebsiteIdAndDate(websiteId, date) {
      try {
        const response = await fetch(
          `${adServerUrl}/get-website-statistics-by-website-id-and-date?websiteId=${encodeURIComponent(
            websiteId
          )}&date=${encodeURIComponent(date)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const websiteStatistics = await response.json();
        return websiteStatistics;
      } catch (error) {
        console.error("Failed to get website statistics:", error);
      }
    }

    async function updateWebsiteStatistics(websiteStatistics) {
      try {
        const response = await fetch(
          adServerUrl + "/update-website-statistics",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(websiteStatistics),
          }
        );
        if (response.ok) {
        } else {
          console.error(
            "Failed to update website statistics:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Failed to update website statistics:", error);
      }
    }

    async function saveWebsiteStatistics(websiteStatistics) {
      try {
        const response = await fetch(
          adServerUrl + "/save-website-statistics",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(websiteStatistics),
          }
        );
        if (response.error) {
          console.error(
            "Failed to save website statistics:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Failed to save website statistics:", error);
      }
    }

    const targetNode = document.body;
    const config = { attributes: true, childList: true, subtree: true };

    const callback = function (mutationsList, observer) {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          console.log('A child node has been added or removed.');
          collectAndLoadAd();
        } else if (mutation.type === 'attributes') {
          console.log('The ' + mutation.attributeName + ' attribute was modified.');
        }
      }
    };

    const observer = new MutationObserver(callback);

    function observeDOMChanges() {
      observer.observe(targetNode, config);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        observeDOMChanges();
        collectAndLoadAd();
      });
    } else {
      observeDOMChanges();
      collectAndLoadAd();
    }

})();
