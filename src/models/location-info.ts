interface Currency {
    code: string;
    name: string;
    symbol: string;
}

interface TimeZone {
    name: string;
    offset: number;
    offset_with_dst: number;
    abbreviation: string;
    is_dst: boolean;
    current_time: string;
}
  
export class LocationInfo {
    calling_code: string;
    city: string;
    connection_type: string;
    continent_code: string;
    continent_name: string;
    country_capital: string;
    country_code2: string;
    country_code3: string;
    country_emoji: string;
    country_flag: string;
    country_name: string;
    country_name_official: string;
    country_tld: string;
    currency: Currency;
    district: string;
    geoname_id: string;
    ip: string;
    is_eu: boolean;
    isp: string;
    languages: string;
    latitude: string;
    longitude: string;
    organization: string;
    state_code: string;
    state_prov: string;
    time_zone: TimeZone;
    zipcode: string;
  
    constructor(data: Partial<LocationInfo>) {
      this.calling_code = data.calling_code || '';
      this.city = data.city || '';
      this.connection_type = data.connection_type || '';
      this.continent_code = data.continent_code || '';
      this.continent_name = data.continent_name || '';
      this.country_capital = data.country_capital || '';
      this.country_code2 = data.country_code2 || '';
      this.country_code3 = data.country_code3 || '';
      this.country_emoji = data.country_emoji || '';
      this.country_flag = data.country_flag || '';
      this.country_name = data.country_name || '';
      this.country_name_official = data.country_name_official || '';
      this.country_tld = data.country_tld || '';
      this.currency = data.currency || { code: '', name: '', symbol: '' };
      this.district = data.district || '';
      this.geoname_id = data.geoname_id || '';
      this.ip = data.ip || '';
      this.is_eu = data.is_eu || false;
      this.isp = data.isp || '';
      this.languages = data.languages || '';
      this.latitude = data.latitude || '';
      this.longitude = data.longitude || '';
      this.organization = data.organization || '';
      this.state_code = data.state_code || '';
      this.state_prov = data.state_prov || '';
      this.time_zone = data.time_zone || { name: '', offset: 0, offset_with_dst: 0, abbreviation: '', is_dst: false, current_time: '' };
      this.zipcode = data.zipcode || '';
    }
}
  