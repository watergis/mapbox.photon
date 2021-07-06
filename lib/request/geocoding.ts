import { Map as MapboxMap } from 'mapbox-gl';
import PhotonRequest, { PhotonGeocodingOptions } from './base';

export type GeocodingOptions = {
  url?: string;
  limit?: number;
  osm_tag?: string;
  lang?: string;
  bbox?: number[];
  includePosition?: boolean;
}

export default class PhotonGeocoding {
    private map: MapboxMap;

    private options: GeocodingOptions = {
      url: 'https://photon.komoot.io/api?',
      limit: 5,
      osm_tag: undefined,
      lang: undefined,
      bbox: [],
      includePosition: true,
    }

    constructor(map: MapboxMap, options: GeocodingOptions) {
      this.map = map;
      if (options) {
        this.options = Object.assign(this.options, options);
      }
    }

    public geocode(query: string, callback: Function) {
      if (!this.options.url) throw new Error('No url');
      const center = this.map.getCenter();
      const zoom = this.map.getZoom() ? this.map?.getZoom() : 14;
      const ajax = new PhotonRequest(this.options.url);
      const options: PhotonGeocodingOptions = {
        q: query,
        limit: this.options.limit,
        zoom: Math.floor(zoom),
      };
      if (this.options.includePosition) {
        options.lat = center?.lat;
        options.lon = center?.lng;
      }
      if (this.options.bbox && this.options.bbox.length === 4) {
        options.bbox = this.options.bbox.join(',');
      }
      if (this.options.osm_tag) {
        options.osm_tag = this.options.osm_tag;
      }
      if (this.options.lang) {
        options.lang = this.options.lang;
      }
      ajax.request(options).then((features: GeoJSON.FeatureCollection) => { callback(features); });
    }
}
