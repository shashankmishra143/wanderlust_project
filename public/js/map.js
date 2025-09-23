mapboxgl.accessToken = mapToken;
const coordinates = listing.geometry.coordinates;

const map = new mapboxgl.Map({
        container: 'map', // container ID
        center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });
console.log(coordinates);
const marker = new mapboxgl.Marker({color: "red"})
 .setLngLat(coordinates)
 .setPopup(new mapboxgl.Popup({offset: 25})
 .setHTML(`<h4>${listing.location}</h4><p>Exact location will be provided after booking</P>`))
 .addTo(map);



