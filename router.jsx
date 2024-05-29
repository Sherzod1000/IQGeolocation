import App from "./src/App.jsx";
import {createBrowserRouter} from "react-router-dom";
import {LocationTableView} from "./src/components/UI/LocationTableView.jsx";
import {LocationMapView} from "./src/components/UI/LocationMapView.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children: [
      {
        index: true,
        element: <LocationTableView/>
      },
      {
        path: "/map-view",
        element: <LocationMapView/>
      }
    ]
  }
]);