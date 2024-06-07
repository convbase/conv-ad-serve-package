    (function() {
      var script = document.currentScript;
      var adServerUrl = "http://127.0.0.1:5000";
      var adContainerId = script.getAttribute('data-ad-container-id');
      var hash = script.getAttribute('data-hash');
      
      function getBrowserInfo() {
        return {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          screenWidth: screen.width,
          screenHeight: screen.height,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      }

      function getISOCode(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.ipgeolocation.io/ipgeo?apiKey=b241516d57d94b4ca206ed8656a81155', true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              var response = JSON.parse(xhr.responseText);
              callback(response.country_code2); // Assuming the API returns the country code in this field
            } else {
              console.error('Failed to get ISO code:', xhr.status, xhr.statusText);
              callback(null);
            }
          }
        };
        xhr.send();
      }

      async function loadAd(userData) {
        try {
          const response = await fetch(adServerUrl + "/get-ad", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          const adData = await response.json();
          adData.forEach((ad, index) => {
            const adContainers = document.querySelectorAll('.ad-container');
            const adContainer = adContainers[index];
            if (adContainer) {
              const html_ad = getAdHtml(ad);
              adContainer.innerHTML = html_ad;
              // Store the ad ID in the adData object
              ad.adId = ad.id;
              attachAdClickListener(adContainer, ad);
            } else {
              console.error(`No ad container found for ad at index ${index}`);
            }
          });
        } catch (error) {
          console.error('Failed to load ad:', error);
        }
      }


      // 
      function getAdHtml(ad) {
        if (ad.ad_format === 'image') {
              return `<a href="${ad.url}" target="_blank"><img src="${ad.image}" style="width: 100%; height: 100%; object-fit: contain;" alt="${ad.title}"></a>`;
            } else if (ad.ad_format === 'text') {
              return `<a href="${ad.url}">${ad.title}</a>`;
            } else if (ad.ad_format === 'video') {
              return `
                <div>
                  <video width="100%" height="100%" controls>
                    <source src="${ad.video_url}" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>
                  <a href="${ad.url}">Learn more</a>
                </div>
              `;
            } else if (ad.ad_format === 'popup') {
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
            } else if (ad.ad_format === 'rich_media') {
              return `
                <div>
                  <div style="background-image: url(${ad.background_image}); background-size: cover; height: 300px; width: 300px;">
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
        adContainer.addEventListener('click', function(event) {
          console.log("AD DATA: ", adData);
          var adClickData = {
            eventType: 'adClick',
            ad: adData,
            clickedElement: event.target.tagName,
            timestamp: new Date().toISOString()
          };
          sendAdClickData(adClickData);
        });
      }

      function sendAdClickData(adClickData) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', adServerUrl + '/ad-click', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status !== 200) {
              console.error('Failed to send ad click data:', xhr.status, xhr.statusText);
            }
          }
        };
        xhr.send(JSON.stringify(adClickData));
      }

      async function getWebsiteByURL(url) {
        try {
          const response = await fetch(adServerUrl + "/get-website-by-url", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            params: {
              url: url
            }
          });
          const website = await response.json();
          return website;
        } catch (error) {
          console.error('Failed to get website:', error);
        }
      }

      async function getWebsiteStatisticsByWebsiteIdAndDate(websiteId, date) {
        try {
          const response = await fetch(adServerUrl + "/get-website-statistics-by-website-id-and-date", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            params: {
              websiteId: websiteId,
              date: date
            }
          });
          const websiteStatistics = await response.json();
          return websiteStatistics;
        } catch (error) {
          console.error('Failed to get website statistics:', error);
        }
      }

      async function updateWebsiteStatistics(websiteStatistics) {
        try {
          const response = await fetch(adServerUrl + "/update-website-statistics", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(websiteStatistics)
          });
          if (response.ok) {
            console.log('Website statistics updated successfully');
          } else {
            console.error('Failed to update website statistics:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Failed to update website statistics:', error);
        }
      }

      async function saveWebsiteStatistics(websiteStatistics) {
        try {
          const response = await fetch(adServerUrl + "/save-website-statistics", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(websiteStatistics)
          });
          if (response.ok) {
            console.log('Website statistics saved successfully');
          } else {
            console.error('Failed to save website statistics:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Failed to save website statistics:', error);
        }
      }


      async function collectAndLoadAd() {
        var browserInfo = getBrowserInfo();
        getISOCode(function(countryCode) {
          var userData = {
            browserInfo: browserInfo,
            isoCode: countryCode,
            hash: hash
          };
          loadAd(userData);
          // Get website by URL
          const websiteUrl = window.location.href;
          getWebsiteByURL(websiteUrl).then(website => {
            if (website) {
              const websiteId = website.id;
              const date = new Date().toISOString().split('T')[0];
              // Check if website statistics already exists for today
              getWebsiteStatisticsByWebsiteIdAndDate(websiteId, date).then(websiteStatistics => {
                if (websiteStatistics) {
                  // Update existing website statistics
                  websiteStatistics.page_views += 1;
                  websiteStatistics.ad_clicks += 0; // assuming no ad click for now
                  websiteStatistics.ad_delivered += 0; // assuming no ad delivered for now
                  updateWebsiteStatistics(websiteStatistics);
                } else {
                  // Create new website statistics if it doesn't exist
                  const newWebsiteStatistics = {
                    website_id: websiteId,
                    date: date,
                    page_views: 1,
                    ad_clicks: 0,
                    ad_delivered: 0,
                    bounce_rate: 0.00
                  };
                  saveWebsiteStatistics(newWebsiteStatistics);
                }
              });
            } else {
              console.error('Website not found');
            }
          });
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', collectAndLoadAd);
      } else {
        collectAndLoadAd();
      }

      window.addEventListener('beforeunload', function() {
        if (scriptExecuted) {
          // Clean up resources and abort requests
          xhr.abort();
          // Remove event listeners
          document.removeEventListener('DOMContentLoaded', collectAndLoadAd);
          adContainer.removeEventListener('click', attachAdClickListener);
        }
      });
    })();
