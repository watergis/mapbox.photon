export type PhotonRequestOptions = {
  q: string,
  limit?: number,
  lon?: number,
  lat?: number,
  zoom?: number,
  locationForBias?: number,
  scale?: number,
  language?: string,
  bbox?: number[],
  debug?: boolean,
}

export default class PhotonRequest {
    private url: string;

    constructor(url: string) {
      this.url = url;
    }

    async request(params: PhotonRequestOptions) {
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