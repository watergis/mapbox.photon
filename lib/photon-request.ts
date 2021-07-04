export type PhotonRequestOptions = {
  q: string,
  limit?: number,
  lon?: number,
  lat?: number,
  zoom?: number,
  locationForBias?: number,
  scale?: number,
  lang?: string,
  bbox?: string,
  debug?: boolean,
  osm_tag?: string,
}

export type PhotonReverseOptions = {
  lang?: string,
  limit?: number,
  lat: number,
  lon: number,
  osm_tag?: string,
}

export default class PhotonRequest {
    private url: string;

    constructor(url: string) {
      this.url = url;
    }

    async request(params: PhotonRequestOptions | PhotonReverseOptions) {
      const url = `${this.url}${Object.keys(params).map((k) => `${k}=${params[k]}`).join('&')}`;
      return new Promise<GeoJSON.FeatureCollection>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
          if (xhr.status === 200) {
            const raw = xhr.responseText;
            const geojson = JSON.parse(raw);
            resolve(geojson);
          } else {
            reject(xhr.statusText);
          }
        };
        xhr.send();
      });
    }
}
