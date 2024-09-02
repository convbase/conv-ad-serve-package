export class CachedWebsite {
    id: number; 
    profile_id: number;
    website_url: string;

    constructor(
        id: number,
        profile_id: number,
        website_url: string,
    ) {
        this.id = id;
        this.profile_id = profile_id;
        this.website_url = website_url;
    }
}