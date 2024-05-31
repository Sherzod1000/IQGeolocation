import { Col, Input, Message, Modal, Row } from "@iqueue/ui-kit";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import { useContext, useEffect, useRef, useState } from "react";
import {
  INITIAL_MAP_MSG,
  isForcedSubmitUsed,
  map_token,
  SUCCESS_ACCEPT_MSG,
} from "./helper/constants.js";
import {
  calculateCentroid,
  checkLocationsExist,
  getLocations,
  getRandomId,
  locationExist,
  validateEmptySpaces,
} from "./helper/functions.js";
import axios from "axios";
import { LocationContext } from "../context/locationContext.jsx";

export function AddNewLocationModal({
  isAdd: { isOpen: isAddOpen, setIsOpen: setAddIsOpen },
  isEdit: { isOpen: isEditOpen, setIsOpen: setEditIsOpen, data },
}) {
  const { locations, setLocations } = useContext(LocationContext);
  const mapContainer = useRef(null);
  const locationRef = useRef(null);
  const submitRef = useRef(null);
  const [mapMessage, setMapMessage] = useState(INITIAL_MAP_MSG);
  const [isValidPolygon, setIsValidPolygon] = useState(false);
  const [isValidLocationName, setIsValidLocationName] = useState(true);
  const [locationNameErrMsg, setLocationNameErrMsg] = useState("");
  const [currentFeature, setCurrentFeature] = useState(null);
  const [userLocation, setUserLocation] = useState({
    latitude: 41.34557,
    longitude: 69.284599,
  });
  const [polygon, setPolygon] = useState([]);
  const [editPolygon, setEditPolygon] = useState([]);
  const [bufferPolygon, setBufferPolygon] = useState([]);
  const [editBufferPolygon, setEditBufferPolygon] = useState([]);
  const map = useRef(null);
  const drawControl = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
  });
  const geoControl = new mapboxgl.GeolocateControl();
  const navigateControl = new mapboxgl.NavigationControl();

  useEffect(() => {
    if (isEditOpen) {
      setPolygon(data.polygon);
      setIsValidPolygon(true);
      setBufferPolygon(data.bufferPolygon);
      controlSubmitButton(true);
    }
  });

  function updateArea(e, map) {
    let editedFeature = null;
    if (isEditOpen && drawControl.getAll().features.length) {
      editedFeature = drawControl.getAll().features;
      setEditPolygon(() => [...drawControl.getAll().features]);
    }
    if (e.type === "draw.delete") {
      setBufferPolygon([]);
      setPolygon([]);
      setMapMessage(INITIAL_MAP_MSG);
      if (map.current) {
        map.current.removeLayer("buffer");
      }
    }
    let buffer = null;
    let differ = null;
    if (isAddOpen && drawControl.getAll().features.length) {
      buffer = turf.buffer(drawControl.getAll().features[0], 200, {
        units: "meters",
      });
      differ = turf.difference(buffer, drawControl.getAll().features[0]);
    }
    if (isEditOpen && editedFeature) {
      buffer = turf.buffer(editedFeature[0], 200, {
        units: "meters",
      });
      differ = turf.difference(buffer, editedFeature[0]);
    }

    if (differ) {
      if (isAddOpen) {
        setBufferPolygon(() => [differ]);
      }
      if (isEditOpen) {
        setEditBufferPolygon(() => [differ]);
      }
      if (map.current.getSource("buffer")) {
        map.current.getSource("buffer").setData(differ);
      } else {
        map.current.addSource("buffer", {
          type: "geojson",
          data: differ,
        });
        map.current.addLayer({
          id: "buffer",
          type: "fill",
          source: "buffer",
          paint: {
            "fill-color": "#f00",
            "fill-opacity": 0.2,
          },
        });
      }
    }

    if (
      drawControl?.getAll()?.features?.length &&
      drawControl?.getAll().features[0].geometry.coordinates[0].length > 2
    ) {
      const isPolygons = drawControl
        .getAll()
        .features.every((feature) => feature.geometry.type === "Polygon");
      if (isPolygons) {
        setIsValidPolygon(true);
        setMapMessage(SUCCESS_ACCEPT_MSG);
        setPolygon(() => [...drawControl.getAll().features]);
      } else {
        setIsValidPolygon(false);
        setMapMessage("Only polygon are accepted, please provide polygon !");
      }
    }
  }

  function controlSubmitButton(isForcedValid = false) {
    validateEmptySpaces(locationRef);
    if (isForcedValid && !isForcedSubmitUsed.isUsed) {
      submitRef.current.disabled = false;
      isForcedSubmitUsed.isUsed = true;
      return;
    }
    const locationExists = locationExist(
      locations,
      locationRef,
      isEditOpen,
      data?.location_name,
    );
    if (locationExists) {
      setIsValidLocationName(false);
      setLocationNameErrMsg("This location name already exist !");
    } else {
      setIsValidLocationName(true);
      setLocationNameErrMsg("");
    }
    if (
      polygon.length &&
      bufferPolygon.length &&
      locationRef.current.value.length > 0 &&
      !locationExists
    ) {
      submitRef.current.disabled = false;
    } else {
      submitRef.current.disabled = true;
    }
  }

  function handleModalClose() {
    resetModal();
  }

  async function handleModalSubmit() {
    resetModal();
    let centroidArea = null;
    if (isAddOpen) {
      centroidArea = calculateCentroid(polygon[0].geometry.coordinates[0]);
    }

    if (isEditOpen) {
      console.log("Edit Polygon: ", editPolygon);
      if (editPolygon.length) {
        centroidArea = calculateCentroid(
          editPolygon[0].geometry.coordinates[0],
        );
      } else {
        centroidArea = calculateCentroid(polygon[0].geometry.coordinates[0]);
      }
    }
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${centroidArea[0]},${centroidArea[1]}.json?access_token=${map_token}`;

    const responseGeoDecode = await axios.get(url);
    const cancelMsg = Message({
      title: "Loading...",
      type: "loading",
      timeout: 10000,
    });

    if (responseGeoDecode.status === 200) {
      cancelMsg();
      Message({
        title: `Successfully ${isEditOpen ? "edited" : "created"} !`,
        type: "success",
        timeout: 1500,
      });

      if (isEditOpen) {
        const foundObject = locations.find(({ id }) => id === data.id);
        foundObject.location_name = locationRef.current.value;
        foundObject.country =
          responseGeoDecode.data.features.at(-1).text || "Unknown";
        foundObject.city =
          responseGeoDecode.data.features.at(-2).text || "Unknown";
        foundObject.features = responseGeoDecode.data.features;
        foundObject.polygon = editPolygon;
        foundObject.bufferPolygon = editBufferPolygon;
        setLocations(() => [...locations]);
      } else {
        const newData = {
          id: getRandomId(),
          location_name: locationRef.current.value,
          country: responseGeoDecode.data.features.at(-1).text || "Unknown",
          city: responseGeoDecode.data.features.at(-2).text || "Unknown",
          features: responseGeoDecode.data.features,
          polygon,
          bufferPolygon,
        };
        setLocations(
          checkLocationsExist() ? [...getLocations(), newData] : [newData],
        );
      }
    } else {
      Message({
        title: "Error occurred !",
        type: "error",
      });
    }
  }

  function resetModal() {
    setPolygon([]);
    setAddIsOpen(false);
    setEditIsOpen(false);
    setMapMessage(INITIAL_MAP_MSG);
  }

  useEffect(() => {
    if (isAddOpen || isEditOpen) {
      mapboxgl.accessToken = map_token;
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15,
      });
      map.current.addControl(drawControl, "top-left");
      map.current.addControl(geoControl, "top-right");
      map.current.addControl(navigateControl, "top-right");
      if (isAddOpen) {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude, longitude } }) => {
            setUserLocation(() => ({ latitude, longitude }));
          },
          (err) => {
            console.log(err);
          },
        );
      }

      if (isEditOpen) {
        if (map.current) {
          const bbox = turf.bbox(data?.polygon?.[0]);
          map.current.fitBounds(bbox, {
            padding: 100,
            animate: false,
          });
        }

        setPolygon(data?.polygon);
        setIsValidPolygon(true);
        setMapMessage(SUCCESS_ACCEPT_MSG);
        map.current.on("load", () => {
          map.current.addSource("polygon", {
            type: "geojson",
            data: data?.polygon?.[0],
          });

          map.current.addLayer({
            id: "polygon",
            type: "fill",
            source: "polygon",
            layout: {},
            paint: {
              "fill-color": "#ff9800",
              "fill-opacity": 0.4,
            },
          });

          map.current.addLayer({
            id: "polygon-outline",
            type: "line",
            source: "polygon",
            layout: {},
            paint: {
              "line-color": "#ff9800",
              "line-width": 1,
            },
          });
          data.polygon.forEach((feature) => {
            drawControl.add(feature);
          });
          map.current.on("draw.render", () => {
            const features = polygon;
            if (features.length) {
              drawControl.changeMode("direct_select", {
                featureId: features[0].id,
              });
            }
          });
        });
      }
      map.current.on("draw.create", (e) => updateArea(e, map));
      map.current.on("draw.delete", (e) => updateArea(e, map));
      map.current.on("draw.update", (e) => updateArea(e, map));
      map.current.on("draw.selectionchange", (e) => {
        if (e.features.length) {
          setCurrentFeature(e.features[0]);
        } else {
          setCurrentFeature(null);
        }
      });
      map.current.on("draw.modechange", () => {
        map.current.on("mousemove", (e) => updateArea(e, map));
      });
      controlSubmitButton();
    }
  }, [isAddOpen, isEditOpen]);
  useEffect(() => {
    if (isAddOpen || isEditOpen) {
      controlSubmitButton();
      locationRef.current.addEventListener("keyup", controlSubmitButton);
    }
  }, [polygon, locationRef?.current?.value]);

  return (
    <>
      <Modal
        title={`${(isEditOpen && "Edit current location") || (isAddOpen && "Add new location")}`}
        isOpened={isAddOpen || isEditOpen}
        onClose={() => {
          if (isAddOpen) {
            setAddIsOpen(false);
          }
          if (isEditOpen) {
            setEditIsOpen(false);
          }
          setMapMessage(INITIAL_MAP_MSG);
          setIsValidPolygon(false);
        }}
        onApply={handleModalSubmit}
        footerActions={[
          {
            key: "cancel",
            title: "Cancel",
            danger: true,
            onClick: handleModalClose,
          },
          {
            key: "submit",
            title: "Submit",
            primary: true,
            buttonRef: submitRef,
            submit: true,
          },
        ]}
      >
        <Row>
          <Col className={"pb-4"} vertical={true}>
            <Row>
              <Input
                autoComplete={"off"}
                ref={locationRef}
                className={`w-full`}
                placeholder={
                  locationNameErrMsg
                    ? locationNameErrMsg
                    : "Enter location name"
                }
                required
                checkValidity={() => isValidLocationName}
                size={12}
                name={"location_name"}
                value={isEditOpen ? data.location_name : ""}
              />
            </Row>

            <Row>
              <Col>
                <small
                  className={`${polygon.length && isValidPolygon ? "text-success" : "text-danger"}`}
                >
                  {mapMessage}
                </small>
                <div ref={mapContainer} className={"mapbox"}></div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Modal>
    </>
  );
}
