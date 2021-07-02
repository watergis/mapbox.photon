import { IControl, Map as MapboxMap } from 'mapbox-gl';
import PhotonSearch, { PhotonOptions } from './photon-search';

/**
 * Mapbox GL Geocoder Control for Photon.
 * @param {Object} targets - Object of layer.id and title
 */
export default class MapboxPhotonGeocoder implements IControl {
    private controlContainer: HTMLElement;

    private map: MapboxMap;

    private searchBox: HTMLInputElement;

    private photonSearch: PhotonSearch;

    private options: PhotonOptions;

    constructor(options: PhotonOptions) {
      if (!options) {
        this.options = {};
      } else {
        this.options = options;
      }
    }

    public getDefaultPosition(): string {
      const defaultPosition = 'top-left';
      return defaultPosition;
    }

    public onAdd(map: MapboxMap): HTMLElement {
      this.map = map;
      this.controlContainer = document.createElement('div');
      this.controlContainer.classList.add('mapboxgl-ctrl');
      this.controlContainer.classList.add('mapboxgl-ctrl-group');

      this.searchBox = document.createElement('input');
      this.controlContainer.appendChild(this.searchBox);

      this.photonSearch = new PhotonSearch(this.searchBox, this.map, this.options);
      this.photonSearch.initialize();

      return this.controlContainer;
    }

    public onRemove(): void {
      if (!this.controlContainer
        || !this.controlContainer.parentNode
        || !this.map
        || !this.searchBox) {
        return;
      }
      this.controlContainer.parentNode.removeChild(this.controlContainer);
    }
}
