import { IControl, Map as MapboxMap } from 'mapbox-gl';
import PhotonSearch, { SearchOptions, Choice } from './photon-search';
import PopupManager, { PopupOptions } from './popup-manager';

/**
 * Mapbox GL Geocoder Control for Photon.
 * @param {Object} targets - Object of layer.id and title
 */
export default class MapboxPhotonGeocoder implements IControl {
    private controlContainer: HTMLElement;

    private map: MapboxMap;

    private searchBox: HTMLInputElement;

    private photonSearch: PhotonSearch;

    private popupManager: PopupManager;

    private searchOptions: SearchOptions;

    private popupOptions: PopupOptions;

    constructor(searchOptions: SearchOptions = {}, popupOptions: PopupOptions = {}) {
      this.searchOptions = searchOptions;
      this.popupOptions = popupOptions;
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

      this.popupManager = new PopupManager(
        map,
        this.popupOptions,
      );

      if (!this.searchOptions.onSelected) {
        this.searchOptions.onSelected = this.onSelected.bind(this);
      }
      this.photonSearch = new PhotonSearch(this.searchBox, this.map, this.searchOptions);
      this.photonSearch.initialize();

      return this.controlContainer;
    }

    private onSelected(choice: Choice) {
      this.popupManager.add(choice.feature);
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
