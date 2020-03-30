export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiamppbGlua2lyaWFuIiwiYSI6ImNrOGFoOWF5aTAyOGozanF0Y2l2eThsM2cifQ.pVbss7N0HCc0d8YblDuEqg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jjilinkirian/ck8ahfgtg12f11imogij0sv9f',
    scrollZoom: false
    //center: [-118.11, 34.11],
    //zoom: 4
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
