import { Map as MapboxMap, Popup, Marker } from 'mapbox-gl';

export default class PopupManager {
    private map: MapboxMap

    private marker: Marker | null = null;

    private zoom: number;

    private createContentFunction: Function | undefined;

    constructor(map: MapboxMap, zoom: number = 14, createContent?: Function) {
      this.map = map;
      this.zoom = zoom;
      this.createContentFunction = createContent;
    }

    _createContent(feature: GeoJSON.Feature) : string {
      const props = feature.properties;
      if (!props) return '';
      let content = '';
      if (props.name) {
        content = props.name;
      }
      const details: string[] = [];
      ['housenumber', 'street', 'locality', 'city', 'district', 'state', 'postcode', 'country'].forEach((key: string) => {
        if (props[key]) {
          details.push(props[key]);
        }
      });
      if (details.length > 0) {
        content += `
        <br>
        ${details.join(',')}
        `;
      }
      return content;
    }

    createContent(feature: GeoJSON.Feature) {
      return (this.createContentFunction)
        ? this.createContentFunction(feature)
        : this._createContent(feature);
    }

    add(feature: GeoJSON.Feature) {
      const popup = new Popup()
        .setHTML(this.createContent(feature))
        .setMaxWidth('300px');
      if (this.marker) {
        this.marker.remove();
      }
      // @ts-ignore
      const lngLat = feature.geometry.coordinates;
      this.marker = new Marker()
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(this.map);
      this.marker.togglePopup();
      let currentZoom = this.map.getZoom();
      if (currentZoom < this.zoom) {
        currentZoom = this.zoom;
      }
      this.map.flyTo({
        center: lngLat,
        zoom: currentZoom,
      });
    }

    clear() {
      this.marker?.remove();
      this.marker = null;
    }
}
