(function() {
    var script = document.currentScript;
    var adServerUrl = script.getAttribute('data-ad-server-url');
    var adContainerId = script.getAttribute('data-ad-container-id');
    var hash = script.getAttribute('data-hash');
    var websiteUrl = script.getAttribute('data-website-url');

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

  function loadAd(userData) {
    scriptExecuted = true;
    fetch(adServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(adData => {
      console.log("adData: ", adData);
      adData.forEach((ad, index) => {
        const adContainers = document.querySelectorAll('.ad-container');
        const adContainer = adContainers[index];
        const html_ad = getAdHtml(ad);
        adContainer.innerHTML = html_ad;
        attachAdClickListener(adContainer);
      });
    })
    .catch(error => {
      console.error('Failed to load ad:', error);
      document.querySelectorAll('.ad-container').innerHTML = "<p>Failed to load ad</p>";
    });
  }

  // 
  function getAdHtml(ad) {
    if (ad.ad_format === 'image') {
          return `<a href="${ad.url}"><img src="${ad.image}" style="width: 100%; height: 100%; object-fit: contain;" alt="${ad.title}"></a>`;
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


  function attachAdClickListener(adContainer) {
    adContainer.addEventListener('click', function(event) {
      var adClickData = {
        eventType: 'adClick',
        adId: adContainerId,
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

  function collectAndLoadAd() {
    var browserInfo = getBrowserInfo();
    getISOCode(function(countryCode) {
      var userData = {
        browserInfo: browserInfo,
        isoCode: countryCode,
        websiteUrl: websiteUrl
      };
      loadAd(userData);
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
