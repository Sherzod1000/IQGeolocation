import { Input, Message } from "@iqueue/ui-kit";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useGeolocation } from "../hooks/useGeolocation.jsx";
import { fetchDataFromOpenStreetMap } from "../helper/functions.js";
import * as turf from "@turf/turf";

export function LocationMarkView() {
  const map = useRef(null);
  const addressRef = useRef(null);
  const { latitude, longitude, err } = useGeolocation();
  const navControl = new mapboxgl.NavigationControl();
  const geoControl = new mapboxgl.GeolocateControl();
  const [polygon, setPolygon] = useState(null);
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v11",
      center: !err ? [longitude, latitude] : [45, 61],
      zoom: 10,
    });
    map.current.addControl(geoControl, "top-right");
    map.current.addControl(navControl, "top-right");
    map.current.on("load", () => {
      map.current.addSource("population", {
        type: "geojson",
        data: "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "population",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#99ffa1",
            100,
            "#75f1e0",
            750,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
        },
      });

      map.current.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "population",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      map.current.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "population",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      map.current.on("click", "clusters", (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        map.current
          .getSource("population")
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });

      map.current.on("click", "unclustered-point", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const mag = e.features[0].properties.mag;
        const tsunami = e.features[0].properties.tsunami === 1 ? "yes" : "no";

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`)
          .addTo(map.current);
      });

      map.current.on("mouseenter", "clusters", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "clusters", () => {
        map.current.getCanvas().style.cursor = "";
      });
    });
  }, []);
  useEffect(() => {
    if (!map.current) return;
    map.current.setCenter([longitude, latitude]);
  }, [latitude, longitude]);
  useEffect(() => {
    if (map.current && polygon) {
      if (map.current.getLayer("polygon")) {
        map.current.removeLayer("polygon");
        map.current.removeLayer("outline");
        map.current.removeSource("polygon");
      }
      if (map.current.isStyleLoaded()) {
        console.log("Polygon:", polygon);
        const point = turf.point([-45, 61]);
        console.log(point);
        map.current.addSource("polygon", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: polygon.geojson,
          },
        });

        map.current.addLayer({
          id: "polygon",
          type: "fill",
          source: "polygon",
          layout: {},
          paint: {
            "fill-color": "#f00",
            "fill-opacity": 0.2,
          },
        });

        map.current.addLayer({
          id: "outline",
          type: "line",
          source: "polygon",
          layout: {},
          paint: {
            "line-color": "yellow",
            "line-opacity": 0.8,
            "line-width": 2,
          },
        });

        const bbox = turf.bbox(polygon.geojson);
        map.current.fitBounds(bbox, {
          padding: 200,
          duration: 3000,
        });
      }
    }
  }, [polygon]);

  let timeout = null;
  let cancelMsg = null;

  function handleAddressChange() {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (!cancelMsg) {
      cancelMsg = Message({
        type: "loading",
        title: "Loading...",
      });
    }

    timeout = setTimeout(() => {
      if (addressRef.current.value.trim().length > 0) {
        console.log(addressRef.current.value);
        const response = fetchDataFromOpenStreetMap(
          addressRef.current.value.trim(),
        );
        response
          .then((res) => {
            console.log(res);
            if (res.status === 200) {
              if (res.data.length) {
                setPolygon(() => res.data[0]);
                cancelMsg?.();
                Message({
                  type: "success",
                  title: "Success",
                  timeout: 1500,
                  subtitle: "We found this place !",
                });
              } else {
                cancelMsg?.();
                Message({
                  type: "error",
                  title: "Error !!!",
                  timeout: 1500,
                  subtitle: "Wrong address provided.",
                });
              }
            }
          })
          .catch((err) => console.log(err))
          .finally(() => {
            cancelMsg?.();
            cancelMsg = null;
          });
      } else {
        cancelMsg?.();
      }
    }, 800);
  }

  return (
    <>
      <Input
        ref={addressRef}
        onChange={handleAddressChange}
        className={"w-full"}
        size={"auto"}
        placeholder={"Enter any location to mark"}
      />
      <div
        className={"w-full rounded-md"}
        style={{ height: "85%" }}
        id={"map"}
      ></div>
    </>
  );
}
