export class WebsiteStatistics {
    id: number;
    website_id: number;
    profile_id: number;
    date: Date;
    page_views: number;
    ad_delivered: number;
    bounce_rate: number;
    created_at: Date | null;
    updated_at: Date | null;
    unique_visitors: number | null;
  
    constructor(
      id: number,
      website_id: number,
      profile_id: number,
      date: Date,
      page_views: number = 0,
      ad_delivered: number = 0,
      bounce_rate: number = 0.0,
      created_at: Date | null = new Date(),
      updated_at: Date | null = new Date(),
      unique_visitors: number | null = null
    ) {
      this.id = id;
      this.website_id = website_id;
      this.profile_id = profile_id;
      this.date = date;
      this.page_views = page_views;
      this.ad_delivered = ad_delivered;
      this.bounce_rate = bounce_rate;
      this.created_at = created_at;
      this.updated_at = updated_at;
      this.unique_visitors = unique_visitors;
    }
  }
  