import mapboxgl from "mapbox-gl";
import { useContext, useEffect, useRef } from "react";
import { LocationContext } from "../../context/locationContext.jsx";
import { calculateBounds, calculateCentroid } from "../helper/functions.js";

export function LocationMapView() {
  const { locations } = useContext(LocationContext);
  const map = useRef(null);
  const navigationControl = new mapboxgl.NavigationControl();
  const geolocationControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserLocation: true,
  });
  const fullscreenControl = new mapboxgl.FullscreenControl();
  const scaleControl = new mapboxgl.ScaleControl();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v11",
      zoom: 3,
      center: [61, 45],
    });
    map.current.addControl(navigationControl, "top-right");
    map.current.addControl(geolocationControl, "top-right");
    map.current.addControl(fullscreenControl, "top-left");
    map.current.addControl(scaleControl, "bottom-left");
    map.current.on("load", () => {
      const polygons = {
        type: "FeatureCollection",
        features: [...locations.map((location) => location.polygon[0])],
      };
      console.log(polygons);
      map.current.addSource(`polygons-source`, {
        type: "geojson",
        data: polygons,
      });

      // Add the polygon layer
      map.current.addLayer({
        id: `polygons`,
        type: "fill",
        source: `polygons-source`,
        layout: {},
        paint: {
          "fill-color": "#0f0",
          "fill-opacity": 0.14,
        },
      });
      map.current.addLayer({
        id: `polygons-outline`,
        type: "line",
        source: `polygons-source`,
        layout: {},
        paint: {
          "line-color": "#0f0",
          "fill-opacity": 0.8,
        },
      });
      polygons.features.forEach(function (feature) {
        const coordinates = feature.geometry.coordinates[0];
        const centroid = calculateCentroid(coordinates);
        const bounds = calculateBounds(coordinates);
        const popup = new mapboxgl.Popup({ offset: 50 })
          .setHTML(
            `<div class="popup">${
              locations.find((loc) => loc?.polygon?.[0]?.id === feature.id)
                ?.location_name || "Unknown"
            }</div>`,
          )
          .setLngLat(centroid)
          .addTo(map.current);
        const marker = new mapboxgl.Marker()
          .setLngLat(centroid)
          .setPopup(popup)
          .addTo(map.current);

        marker.getElement().addEventListener("click", () => {
          map.current.fitBounds(bounds, { padding: 60 });
        });
      });
    });
  }, []);

  return <div className={"full rounded-md"} id={"map"}></div>;
}
