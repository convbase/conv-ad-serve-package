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

    function getGeolocation(callback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                callback({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            }, function(error) {
                console.error('Geolocation error:', error);
                callback(null);
            });
        } else {
            console.error('Geolocation not supported');
            callback(null);
        }
    }

    function loadAd(userData) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', adServerUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    document.getElementById(adContainerId).innerHTML = xhr.responseText;
                } else {
                    console.error('Failed to load ad:', xhr.status, xhr.statusText);
                    document.getElementById(adContainerId).innerHTML = "<p>Failed to load ad</p>";
                }
            }
        };
        xhr.send(JSON.stringify(userData));
    }

    function collectAndLoadAd() {
        var browserInfo = getBrowserInfo();
        getGeolocation(function(geolocation) {
            var userData = {
                browserInfo: browserInfo,
                geolocation: geolocation,
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
