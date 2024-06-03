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
    console.log("Changing");
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
