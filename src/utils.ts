// utils.js
export function getBrowserInfo() {
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
  
  export function getISOCode(callback: any) {
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
  