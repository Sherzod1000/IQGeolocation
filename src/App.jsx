import './App.css';
import {useTheme, Window} from '@iqueue/ui-kit';
import {useEffect} from 'react';
import {setIds} from './components/helper/functions.js';
import {Outlet} from "react-router-dom";

function App() {
  const {setTheme} = useTheme();
  useEffect(() => {
    setTheme('dark');
    setIds();
  }, []);

  return (
    <>
      <Window title={'IQ Geolocation'}>
        <Outlet/>
      </Window>
    </>
  );
}

export default App;
