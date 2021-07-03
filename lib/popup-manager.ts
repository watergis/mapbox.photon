import { Map as MapboxMap, Popup, Marker } from 'mapbox-gl';

export type PopupOptions = {
  popupZoomLevel?: number,
  createContent?: Function,
}

export default class PopupManager {
    private map: MapboxMap

    private marker: Marker | null = null;

    private options: PopupOptions;

    constructor(map: MapboxMap, options: PopupOptions = {}) {
      this.map = map;
      this.options = options;
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
      return (this.options.createContent)
        ? this.options.createContent(feature)
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
      const defaultZoom = (this.options.popupZoomLevel) ? this.options.popupZoomLevel : 14;
      if (currentZoom < defaultZoom) {
        currentZoom = defaultZoom;
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
