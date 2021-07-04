import PhotonRequest, { PhotonReverseOptions } from './photon-request';

export type ReverseOptions = {
    url?: string;
    limit?: number;
    osm_tag?: string;
    lang?: string;
}

export default class PhotonReverse {
    private options: ReverseOptions = {
      url: 'https://photon.komoot.io/reverse?',
      limit: 5,
      osm_tag: undefined,
      lang: undefined,
    }

    constructor(options: ReverseOptions) {
      if (options) {
        this.options = Object.assign(this.options, options);
      }
    }

    public async reverse(lon: number, lat: number) {
      if (!this.options.url) throw new Error('No url');
      const ajax = new PhotonRequest(this.options.url);
      const options: PhotonReverseOptions = {
        limit: this.options.limit,
        lat,
        lon,
      };
      if (this.options.osm_tag) {
        options.osm_tag = this.options.osm_tag;
      }
      if (this.options.lang) {
        options.lang = this.options.lang;
      }
      const features = await ajax.request(options);
      return features;
    }
}
