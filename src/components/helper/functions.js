export function calculateCentroid(coords) {
  const n = coords.length;
  const { x, y } = coords.reduce(
    ({ x, y }, coord) => {
      x += coord[0];
      y += coord[1];
      return { x, y };
    },
    { x: 0, y: 0 }
  );
  return [x / n, y / n];
}

export function checkLocationsExist() {
  return JSON.parse(localStorage.getItem('locations') || '[]').length > 0;
}

export function getLocations() {
  return JSON.parse(localStorage.getItem('locations') || '[]');
}

import { idSet } from './constants.js';

export function getRandomId() {
  let id = '';
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
  ref.current.value = ref.current.value.replace(/(\S)\s+(\S)/g, '$1 $2'); // Validate empty spaces
}

export function locationExist(locations, ref, isEdit, current_location_name) {
  let result = null;
  if (isEdit) {
    const filteredLocations = locations.filter(
      ({ location_name }) => location_name !== current_location_name
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
      location_name.toLowerCase() === ref.current.value.toLowerCase().trim()
  );
}
