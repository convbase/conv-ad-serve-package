export class Advertisement {
    id: number;
    title: string;
    data: string;
    url: string;
    ad_format: string;
    
    constructor(
      id: number,
      title: string,
      ad_format: string,
      url: string,
      data: string,
    ) {
      this.id = id;
      this.title = title;
      this.ad_format = ad_format;
      this.url = url;
      this.data = data;
      
    }
  }
  