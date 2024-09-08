export class Advertisement {
    id: number;
    title: string;
    data: string;
    url: string;
    ad_format: string; // image | video | rich-media
    ad_type: string; // classic_banners | native_ads | pop_under | header_banner | sticky_banner 
    
    constructor(
      id: number,
      title: string,
      ad_type: string,
      ad_format: string,
      url: string,
      data: string,
    ) {
      this.id = id;
      this.title = title;
      this.ad_type = ad_type;
      this.ad_format = ad_format;
      this.url = url;
      this.data = data;
      
    }
  }
  