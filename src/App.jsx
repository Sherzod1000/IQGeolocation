import "./App.css";
import { Router, useTheme, Window } from "@iqueue/ui-kit";
import { useEffect, useState } from "react";
import { setIds } from "./components/helper/functions.js";
import { LocationTableView } from "./components/UI/LocationTableView.jsx";
import { LocationMapView } from "./components/UI/LocationMapView.jsx";
import { LocationMarkView } from "./components/UI/LocationMarkView.jsx";

function App() {
  const { setTheme } = useTheme();
  const [route, setRoute] = useState("home");
  useEffect(() => {
    setTheme("dark");
    setIds();
  }, []);

  return (
    <>
      <Window
        title={"IQ Geolocation"}
        route={route}
        onNavigate={setRoute}
        nav={[
          {
            divider: true,
            title: "Geolocation board",
          },
          {
            key: "home",
            route: "home",
            title: "Home",
            icon: "home",
          },
          {
            key: "map",
            route: "map",
            icon: "map",
            title: "All locations",
          },
          {
            key: "mark",
            route: "mark",
            icon: "edit",
            title: "Mark location",
          },
        ]}
      >
        <Router
          route={route}
          routes={{
            home: () => <LocationTableView />,
            map: () => <LocationMapView />,
            mark: () => <LocationMarkView />,
          }}
        />
      </Window>
    </>
  );
}

export default App;
