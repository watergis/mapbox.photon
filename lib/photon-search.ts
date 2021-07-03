import { EventData, Map as MapboxMap } from 'mapbox-gl';
import PhotonRequest, { PhotonRequestOptions } from './photon-request';

export type SearchOptions = {
    url?: string;
    placeholder?: string;
    minChar?: number;
    limit?: number;
    osm_tag?: string;
    submitDelay?: number;
    includePosition?: boolean;
    bbox?: number[] | null;
    noResultLabel?: string,
    feedbackUrl?: string,
    feedbackLabel?: string,
    width?: number,
    popupZoomLevel?: number,
    onSelected?: Function,
}

export type Choice = {
  feature: GeoJSON.Feature,
  el: HTMLLIElement,
}

export default class PhotonSearch {
    private input: HTMLInputElement;

    private resultsContainer: HTMLUListElement;

    private map: MapboxMap;

    private options: SearchOptions = {
      url: 'https://photon.komoot.io/api?',
      placeholder: 'Start typing...',
      minChar: 3,
      limit: 5,
      osm_tag: undefined,
      submitDelay: 300,
      includePosition: true,
      bbox: null,
      noResultLabel: 'No result',
      feedbackUrl: 'https://github.com/komoot/photon/issues',
      feedbackLabel: 'Feedback',
      popupZoomLevel: 14,
      onSelected: undefined,
    }

    private submitDelay: number | null;

    private CACHE: string = '';

    private RESULTS: Choice[] = [];

    private _CURRENT: number;

    private get CURRENT(): number {
      return this._CURRENT;
    }

    private set CURRENT(index) {
      if (typeof index === 'object') {
        index = this.resultToIndex(index);
      }
      this._CURRENT = index;
    }

    private KEYS = {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      TAB: 9,
      RETURN: 13,
      ESC: 27,
      APPLE: 91,
      SHIFT: 16,
      ALT: 17,
      CTRL: 18,
    }

    constructor(input: HTMLInputElement, map: MapboxMap, options: SearchOptions) {
      this.input = input;
      this.map = map;
      if (options) {
        this.options = Object.assign(this.options, options);
      }
    }

    initialize() {
      this.input.type = 'search';
      if (this.options.placeholder) this.input.placeholder = this.options.placeholder;
      this.input.autocomplete = 'off';
      // @ts-ignore
      this.input.autocorrect = 'off';
      this.input.classList.add('photon-input');
      this.input.addEventListener('keydown', this.onKeyDown.bind(this));
      this.input.addEventListener('input', this.onInput.bind(this));
      this.input.addEventListener('blur', this.onBlur.bind(this));
      this.input.addEventListener('focus', this.onFocus.bind(this));
      this.createResultsContainer();
    }

    private createResultsContainer() {
      this.resultsContainer = document.createElement('ul');
      this.resultsContainer.classList.add('photon-autocomplete');
      const body = document.querySelector('body');
      body?.appendChild(this.resultsContainer);
    }

    resizeContainer() {
      const l = this.getLeft(this.input);
      const t = this.getTop(this.input) + this.input.offsetHeight / 2;
      this.resultsContainer.style.left = `${l}px`;
      this.resultsContainer.style.top = `${t}px`;
      const width = this.options.width ? this.options.width : this.input.offsetWidth - 2;
      this.resultsContainer.style.width = `${width}px`;
    }

    private onKeyDown(e: EventData): void {
      switch (e.keyCode) {
        case this.KEYS.TAB:
          if (this.CURRENT !== null) {
            this.setChoice();
          }
          e.stopPropagation();
          break;
        case this.KEYS.RETURN:
          e.stopPropagation();
          this.setChoice();
          break;
        case this.KEYS.ESC:
          e.stopPropagation();
          this.hide();
          this.input.blur();
          break;
        case this.KEYS.DOWN:
          if (this.RESULTS.length > 0) {
            if (this.CURRENT !== null && this.CURRENT < this.RESULTS.length - 1) {
              this.CURRENT += 1;
              this.highlight();
            } else if (this.CURRENT === null) {
              this.CURRENT = 0;
              this.highlight();
            }
          }
          break;
        case this.KEYS.UP:
          if (this.CURRENT) {
            e.stopPropagation();
          }
          if (this.CURRENT && this.RESULTS.length > 0) {
            if (this.CURRENT > 0) {
              this.CURRENT -= 1;
              this.highlight();
            } else if (this.CURRENT === 0) {
              this.highlight();
            }
          }
          break;
        default:
          break;
      }
    }

    private onInput(): void {
      if (typeof this.submitDelay === 'number') {
        window.clearTimeout(this.submitDelay);
        this.submitDelay = null;
      }
      this.submitDelay = window.setTimeout(this.search.bind(this), this.options.submitDelay);
    }

    private onBlur(): void {
      const self = this;
      setTimeout(() => {
        self.hide();
      }, 100);
    }

    private onFocus() {
      this.input.select();
      this.search();
    }

    private clear() {
      this.RESULTS = [];
      this.CURRENT = 0;
      this.CACHE = '';
      this.resultsContainer.innerHTML = '';
    }

    private hide() {
      this.clear();
      this.resultsContainer.style.display = 'none';
    }

    private setChoice() {
      const choice: Choice = this.RESULTS[this.CURRENT];
      if (choice) {
        this.hide();
        this.onSelected(choice);
        this.input.value = '';
      }
    }

    private search() {
      const center = this.map.getCenter();
      const zoom = this.map.getZoom() ? this.map?.getZoom() : 14;
      const val = this.input.value;
      const minChar = (this.options.minChar && val.length >= this.options.minChar);
      if (!val || !minChar) {
        this.clear();
        return;
      }
      if (this.options.url && `${val}''` !== `${this.CACHE}''`) {
        this.CACHE = val;
        const ajax = new PhotonRequest(this.options.url);
        const options: PhotonRequestOptions = {
          q: val,
          limit: this.options.limit,
          zoom: Math.floor(zoom),
        };
        if (this.options.includePosition) {
          options.lat = center?.lat;
          options.lon = center?.lng;
        }
        if (this.options.osm_tag) {
          options.osm_tag = this.options.osm_tag;
        }
        ajax.request(options).then(this.handleResult.bind(this));
      }
    }

    private _onSelected(choise: Choice) {}

    private onSelected(choice: Choice) {
      if (this.options.onSelected) {
        this.options.onSelected(choice);
      } else {
        this._onSelected(choice);
      }
    }

    private formatResult(feature: GeoJSON.Feature, el: HTMLLIElement) {
      const title = document.createElement('strong');
      el.appendChild(title);
      const detailsContainer = document.createElement('small');
      el.appendChild(detailsContainer);
      const details: string[] = [];
      const type = this.formatType(feature);
      if (feature.properties?.name) {
        title.innerHTML = feature.properties.name;
      } else if (feature.properties?.housenumber) {
        title.innerHTML = feature.properties.housenumber;
        if (feature.properties.street) {
          title.innerHTML += ` ${feature.properties.street}`;
        }
      }
      if (type) details.push(type);
      if (feature.properties?.city && feature.properties.city !== feature.properties.name) {
        details.push(feature.properties.city);
      }
      if (feature.properties?.country) details.push(feature.properties.country);
      detailsContainer.innerHTML = details.join(', ');
    }

    private formatType(feature: GeoJSON.Feature) {
      return feature.properties?.osm_value === 'yes'
        ? feature.properties.osm_key
        : feature.properties?.osm_value;
    }

    private createResult(feature: GeoJSON.Feature) {
      const el = document.createElement('li');
      this.resultsContainer.appendChild(el);
      this.formatResult(feature, el);
      const result: Choice = {
        feature,
        el,
      };
      el.addEventListener('mouseover', this.onMouseover.bind(this, result));
      el.addEventListener('mousedown', this.onMousedown.bind(this));
      return result;
    }

    private onMouseover(result) {
      this.CURRENT = result;
      this.highlight();
    }

    private onMousedown() {
      this.setChoice();
    }

    private resultToIndex(result) {
      let out = 0;
      this.RESULTS.forEach((item, index) => {
        if (item === result) {
          out = index;
        }
      });
      return out;
    }

    private handleResult(geojson: GeoJSON.FeatureCollection) {
      const self = this;
      this.clear();
      this.resultsContainer.style.display = 'block';
      this.resizeContainer();
      geojson.features.forEach((feature: GeoJSON.Feature) => {
        self.RESULTS.push(self.createResult(feature));
      });
      if (geojson.features.length === 0) {
        const noresult = document.createElement('li');
        noresult.classList.add('photon-no-result');
        this.resultsContainer.appendChild(noresult);
        if (this.options.noResultLabel) noresult.innerHTML = this.options.noResultLabel;
      }
      if (this.options.feedbackUrl) {
        const feedback = document.createElement('a');
        feedback.classList.add('photon-feedback');
        this.resultsContainer.appendChild(feedback);
        feedback.href = `${this.options.feedbackUrl}`;
        if (this.options.feedbackLabel) feedback.innerHTML = this.options.feedbackLabel;
      }
      this.CURRENT = 0;
      this.highlight();
    }

    private highlight() {
      const self = this;
      this.RESULTS.forEach((item, index) => {
        if (index === self.CURRENT) {
          item.el.classList.add('on');
        } else {
          item.el.classList.remove('on');
        }
      });
    }

    private getLeft(el: HTMLElement) {
      let tmp = el.offsetLeft;
      // @ts-ignore
      el = el.offsetParent;
      while (el) {
        tmp += el.offsetLeft;
        // @ts-ignore
        el = el.offsetParent;
      }
      return tmp;
    }

    private getTop(el: HTMLElement) {
      let tmp = el.offsetTop;
      // @ts-ignore
      el = el.offsetParent;
      while (el) {
        tmp += el.offsetTop;
        // @ts-ignore
        el = el.offsetParent;
      }
      return tmp;
    }
}
