# mapbox.photon

![badge](https://github.com/watergis/mapbox.photon/workflows/build/badge.svg)
![badge](https://github.com/watergis/mapbox.photon/workflows/deploy%20gh-pages/badge.svg)
![badge](https://github.com/watergis/mapbox.photon/workflows/Release%20Draft/badge.svg)
![badge](https://github.com/watergis/mapbox.photon/workflows/Node.js%20Package/badge.svg)
![GitHub](https://img.shields.io/github/license/watergis/mapbox.photon)

This module adds control for [Photon](https://github.com/komoot/photon) geocoder.

This plugin was inspired from [leaflet.photon](https://github.com/komoot/leaflet.photon) repository.

## Installation

```bash
npm i @watergis/mapbox.photon --save
```

## Demo

Try [codesandbox](https://codesandbox.io/s/mapboxphoton-xzmyv).

See [demo](https://watergis.github.io/mapbox.photon/#12/-1.08551/35.87063).

![demo](./demo.gif)

## Usage

- note

This plugin uses komoot's photon API (https://photon.komoot.io/api) as default. However, please consider to have your own photon API if you want to use geocoding heavily in order to avoid many traffics for komoot server.

- for geocoding

```ts
import MapboxPhotonGeocoder from "@watergis/mapbox.photon";
import '@watergis/mapbox.photon/css/styles.css';
import mapboxgl from 'mapbox-gl';

const map = new mapboxgl.Map();
map.addControl(new MapboxPhotonGeocoder({
    placeholder: 'Start typing...',
    minChar: 3,
    limit: 5,
    submitDelay: 300,
    noResultLabel: 'No result',
    feedbackUrl: 'https://github.com/komoot/photon/issues',
    feedbackLabel: 'Feedback',
    // default adds a popup, but you may change the behaviour when the POI was selected.
    onSelected: function(choice) {
      console.log(choice);
    },
    // if you want to customise geocoding function
    doSearch: function(query, callback) {
      console.log(query);
    }
  },
  {
    url: 'https://photon.komoot.io/api?',
    limit: 5,
    // if you want to filter by osm_tag parameter
    osm_tag: 'tourism',
    lang: 'ja',
    bbox: [], //specify minx, miny. maxx, maxy if you want to filter by particular area
    includePosition: true,
  },
  {
    // after creating a popup, it will zoom to this default zoom level
    popupZoomLevel: 14,
    // if you want to custmize popup content's html
    createContent: function(feature) {
      return feature.properties.name
    },
  }
}), 'top-left');
```

- for reverse geocoding

```ts
import { PhotonReverse } from "@watergis/mapbox.photon";

const recverse = new PhotonReverse();
const result = await recverse.reverse(35.8664039, -1.0861514);
console.log(result);
```

## Development

```bash
npm run lint # check styling of source code
npm run lint:fix # fix styling by eslint
npm run serve
```

open [http://localhost:8080](http://localhost:8080).

If there are any changes on source code, it will be reflected automatically.

## Build package

```bash
npm run build
```

The modules will be generated under `dist` folder.

## Deploy to Github pages

```bash
npm run deploy
```

It will deploy files under `example` folder to gh-pages.

## How to release

```zsh
vi package.json
# update version in package.json
git add package.json
git commit -m "v1.X.X"
git push origin main
git tag v1.X.X main
git push --tag
# release CI will create draft release in Github pages, then publish it if it is ready.
# publish CI will deploy npmjs and Github Packages.
```

## Contribution

This Mapbox GL Photon Control is still under development. so most welcome any feedbacks and pull request to this repository.
