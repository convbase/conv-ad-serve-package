class nextAdServe {
    constructor(apiUrl, config = {}) {
        this.apiUrl = apiUrl;
        this.config = config;
        this.visitorData = {};
    } 

    /**
     * Collect visitor information
     */
    collectVisitorData() {
        this.visitorData = {
            // Browser information
            browserType: navigator.userAgent,
            browserVersion: navigator.appVersion,
            language: navigator.languagem,

            // Device information
            deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            screenWidth: screen.width,
            screenHeight: screen.height,

            // Location information (using IP geolocation)
            ipAddress: '', // todo: implement IP geolocation
            country: '',
            region: '',
            city: '',

            // Interests and behaviors (todo: implement)
            interests: [],
            behaviors: []
        };
    }

    /**
     * Send visitor data to API and retrieve ads
     */
    getAds() {
        this.collectVisitorData();

        fetch(this.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.visitorData)
        })
        .then(response => response.json())
        .then(data => {
            this.renderAds(data.ads);
        })
        .catch(error => {
            console.error('Error retrieving ads: ', error);
        })
    }

    /**
     * Render ads on the page
     */
    renderAds(ads) {
        const adContainer = document.getElementById('ad-container');
        adContainer.innerHTML = '';

        ads.forEach((ad) => {
            const adElement = document.createComment('div');
            adElement.innerHTML = ad.html;
            adContainer.appendChild(adElement);
        });
    }
}

export default nextAdServe;