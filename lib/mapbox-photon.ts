import { IControl, Map as MapboxMap } from 'mapbox-gl';
import SearchControl, { SearchControlOptions, Choice } from './search-control';
import PhotonGeocoding, { GeocodingOptions } from './photon-geocoding';
import PopupManager, { PopupOptions } from './popup-manager';

/**
 * Mapbox GL Geocoder Control for Photon.
 * @param {Object} targets - Object of layer.id and title
 */
export default class MapboxPhotonGeocoder implements IControl {
    private controlContainer: HTMLElement;

    private map: MapboxMap;

    private searchBox: HTMLInputElement;

    private searchControl: SearchControl;

    private photonGeocoding: PhotonGeocoding;

    private popupManager: PopupManager;

    private searchControlOptions: SearchControlOptions;

    private geocodingOptions: GeocodingOptions;

    private popupOptions: PopupOptions;

    constructor(
      searchControlOptions: SearchControlOptions = {},
      geocodingOptions: GeocodingOptions = {},
      popupOptions: PopupOptions = {},
    ) {
      this.searchControlOptions = searchControlOptions;
      this.geocodingOptions = geocodingOptions;
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

      this.photonGeocoding = new PhotonGeocoding(
        map,
        this.geocodingOptions,
      );

      this.popupManager = new PopupManager(
        map,
        this.popupOptions,
      );

      if (!this.searchControlOptions.onSelected) {
        this.searchControlOptions.onSelected = this.onSelected.bind(this);
      }
      this.searchControlOptions.doSearch = this.photonGeocoding.geocode.bind(this.photonGeocoding);
      this.searchControl = new SearchControl(this.searchBox, this.searchControlOptions);
      this.searchControl.initialize();

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
