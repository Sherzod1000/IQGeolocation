import axios from "axios";
import { idSet } from "./constants.js";

export function calculateCentroid(coords) {
  const n = coords.length;
  const { x, y } = coords.reduce(
    ({ x, y }, coord) => {
      x += coord[0];
      y += coord[1];
      return { x, y };
    },
    { x: 0, y: 0 },
  );
  return [x / n, y / n];
}

export function checkLocationsExist() {
  return JSON.parse(localStorage.getItem("locations") || "[]").length > 0;
}

export function getLocations() {
  return JSON.parse(localStorage.getItem("locations") || "[]");
}

export function getRandomId() {
  let id = "";
  while (true) {
    id = window.crypto.randomUUID();
    if (!idSet.has(id)) {
      idSet.add(id);
      break;
    } else {
    }
  }

  return id;
}

export function setIds() {
  if (checkLocationsExist()) {
    getLocations().forEach((location) => {
      idSet.add(location.id);
    });
  }
}

export function generateObjectWithValues(keysArr, valuesArr) {
  const createdArr = [];
  keysArr.forEach((key, index) => {
    createdArr.push({
      key: index + 1,
      location_key: key,
      location_value: valuesArr[index],
    });
  });
  return createdArr;
}

export function minimizeNumbersOfCoords(coords) {
  return coords.map(([lng, lat]) => {
    return [+lng.toFixed(2), +lat.toFixed(2)];
  });
}

export function validateEmptySpaces(ref) {
  ref.current.value = ref.current.value
    .replace(/(\S)\s+(\S)/g, "$1 $2")
    .trimStart(); // Validate empty spaces
}

export function locationExist(locations, ref, isEdit, current_location_name) {
  let result = null;
  if (isEdit) {
    const filteredLocations = locations.filter(
      ({ location_name }) => location_name !== current_location_name,
    );
    result = findLocation(filteredLocations, ref);
  } else {
    result = findLocation(locations, ref);
  }
  return result;
}

export function findLocation(locations, ref) {
  return locations.find(
    ({ location_name }) =>
      location_name.toLowerCase() === ref.current.value.toLowerCase().trim(),
  );
}

export function calculateBounds(coords) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  coords.forEach((coord) => {
    const lon = coord[0],
      lat = coord[1];
    minX = Math.min(minX, lon);
    minY = Math.min(minY, lat);
    maxX = Math.max(maxX, lon);
    maxY = Math.max(maxY, lat);
  });

  return [
    [minX, minY],
    [maxX, maxY],
  ];
}

export async function fetchDataFromOpenStreetMap(address) {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: address,
        format: "json",
        polygon_geojson: 1,
        addressdetails: 1,
      },
    },
  );

  return response;
}
