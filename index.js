import mapboxgl from 'mapbox-gl';
import MapboxPhotonGeocoder, { PhotonReverse } from '../lib/index';
import '../css/styles.css';

(async()=>{
    // mapboxgl.accessToken='your mapbox access token'
    const map = new mapboxgl.Map({
        container: 'map',
        style:'https://narwassco.github.io/naru/style.json',
        center: [35.87063, -1.08551],
        zoom: 12,
        hash:true,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new MapboxPhotonGeocoder(), 'top-left');

    const recverse = new PhotonReverse();
    const result = await recverse.reverse(35.8664039, -1.0861514);
    console.log(result);
})()