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
        xhr.open('GET', 'https://api.ipgeolocation.io/ipgeo?apiKey=b241516d57d94b4ca206ed8656a81155', true); // Replace with your API URL and key
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
        var xhr = new XMLHttpRequest();
        xhr.open('POST', adServerUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var adData = JSON.parse(xhr.responseText);
                    console.log("adData: ", adData);
                    console.log("JSON.parse: ", JSON.parse(xhr));
                    var html_ad;
                    if (adData.ad_format == 'image') {
                        html_ad = `<a href="${adData.url}"><img src="${adData.image}" alt="${adData.title}"></a>`;
                    } else if (adData.ad_format == 'text') {
                        html_ad = `<a href="${adData.url}">${adData.title}</a>`;
                    } else if (adData.ad_format == 'video') {
                        html_ad = `
                            <div>
                                <video width="100%" height="100%" controls>
                                    <source src="${adData.video_url}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                                <a href="${adData.url}">Learn more</a>
                            </div>
                        `;
                    } else if (adData.ad_format == 'popup') {
                        html_ad = `
                            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
                                <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd;">
                                    <h2>${adData.title}</h2>
                                    <p>${adData.description}</p>
                                    <a href="${adData.url}">Learn more</a>
                                    <button onclick="this.parentNode.parentNode.removeChild(this.parentNode);">Close</button>
                                </div>
                            </div>
                        `;
                    } else if (adData.ad_format == 'rich_media') {
                        html_ad = `
                            <div>
                                <div style="background-image: url(${adData.background_image}); background-size: cover; height: 300px; width: 300px;">
                                    <h2>${adData.title}</h2>
                                    <p>${adData.description}</p>
                                    <a href="${adData.url}">Learn more</a>
                                </div>
                            </div>
                        `;
                    } else {
                        html_ad = `<p>Unknown ad format: ${adData.ad_format}</p>`;
                    }
                    var adContainer = document.getElementById(adContainerId);
                    adContainer.innerHTML = html_ad;
                    attachAdClickListener(adContainer);
                } else {
                    console.error('Failed to load ad:', xhr.status, xhr.statusText);
                    document.getElementById(adContainerId).innerHTML = "<p>Failed to load ad</p>";
                }
            }
        };
        xhr.send(JSON.stringify(userData));
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
                hash: hash,
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
})();
