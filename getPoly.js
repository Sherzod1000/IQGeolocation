import axios from "axios";

const asd = "asdasd";
const value = process.argv.at(-1);
const res = fetchData(value);
res.then((res) => console.log(res?.data)).catch((err) => console.log(err));

async function fetchData(addr) {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: addr,
        format: "json",
        polygon_geojson: 1,
        addressdetails: 1,
      },
    },
  );

  return response;
}
