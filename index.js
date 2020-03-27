import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import OSM from 'ol/source/OSM';

var map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    new TileLayer({
      source: new XYZ({
        url: 'http://localhost:8080/{z}/{x}/{y}.png'
      })
    })
  ],
  view: new View({
    center: [-472202, 7530279],
    zoom: 2
  })
});
