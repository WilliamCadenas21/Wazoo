import React from 'react'
import mapboxgl from 'mapbox-gl'

import rests from '../restaurants' 

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

// This will let you use the .remove() function later on
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

class Map extends React.Component {

  constructor(props: Props) {
    super(props);
    this.state = {
      lng: -74.8090,
      lat: 10.9950,
      zoom: 13.64
    };
  }

  componentDidMount() {
    const { lng, lat, zoom } = this.state;

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [lng, lat],
      zoom
    });

    map.on('load', function(e) {
      // Add the data to your map as a layer
      map.addLayer({
        id: 'locations',
        type: 'symbol',
        // Add a GeoJSON source containing place coordinates and information.
        source: {
          type: 'geojson',
          data: rests
        },
        layout: {
          'icon-image': 'restaurant-15',
          'icon-allow-overlap': true,
        }
      });
    });

    map.on('move', () => {
      const { lng, lat } = map.getCenter();

      this.setState({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });

    // Add an event listener for when a user clicks on the map
    map.on('click', function(e) {
      // Query all the rendered points in the view
      var features = map.queryRenderedFeatures(e.point, { layers: ['locations'] });
      if (features.length) {
        var clickedPoint = features[0];
        // 1. Fly to the point
        map.flyTo({
          center: clickedPoint.geometry.coordinates,
          zoom: 15
        });
        // 2. Close all other popups and display popup for clicked store

        var popUps = document.getElementsByClassName('mapboxgl-popup');
        // Check if there is already a popup on the map and if so, remove it ReactDOM.unmountComponentAtNode(popUps[0]);
        if (popUps[0]) popUps[0].remove();

        var popup = new mapboxgl.Popup({ closeOnClick: false })
            .setLngLat(clickedPoint.geometry.coordinates)
            .setHTML('<h3>'+clickedPoint.properties.name+'</h3>' +
              '<h4>' + clickedPoint.properties.address + '</h4>')
            .addTo(map);
        // 3. Highlight listing in sidebar (and remove highlight for all other listings)
        var activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
          activeItem[0].classList.remove('active');
        }
        // Find the index of the store.features that corresponds to the clickedPoint that fired the event listener
        var selectedFeature = clickedPoint.properties.name;
        var selectedFeatureIndex;
        for (var i = 0; i < rests.features.length; i++) {
          if (rests.features[i].properties.name === selectedFeature) {
            selectedFeatureIndex = i;
          }
        }
        // Select the correct list item using the found index and add the active class
        var listing = document.getElementById('item-' + selectedFeatureIndex);
        listing.classList.add('active');
      }
    });

  }

  render() {
    const { lng, lat, zoom } = this.state;

    return (
      <div class='map pad2'>
        <div className="inline-block absolute top left mt12 ml12 bg-darken75 color-white z1 py6 px12 round-full txt-s txt-bold">
          <div>{`Longitude: ${lng} Latitude: ${lat} Zoom: ${zoom}`}</div>
        </div>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
      </div>
    );
  }
}



export default Map;