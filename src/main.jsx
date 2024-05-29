import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import '@iqueue/ui-kit/lib/ui-kit.css';
import '@iqueue/ui-kit/lib/icons.css';
import '@iqueue/ui-kit/lib/roboto.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './index.css';
import {LocationProvider} from './context/locationContext.jsx';
import {RouterProvider} from "react-router-dom";
import {router} from "../router.jsx";

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <LocationProvider>
    <RouterProvider router={router}>
      <App/>
    </RouterProvider>
  </LocationProvider>
);
