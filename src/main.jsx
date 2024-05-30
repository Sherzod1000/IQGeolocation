import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "@iqueue/ui-kit/lib/ui-kit.css";
import "@iqueue/ui-kit/lib/icons.css";
import "@iqueue/ui-kit/lib/roboto.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./index.css";
import { LocationProvider } from "./context/locationContext.jsx";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <LocationProvider>
    <App />
  </LocationProvider>,
);
