export function filterByColumn(column) {
  return (searchValue, data) =>
    data[column].toLowerCase().includes(searchValue.toLowerCase());
}

export function handleModalActions(currentLocationSetter, modalSetter, value) {
  currentLocationSetter(value);
  modalSetter(true);
}
