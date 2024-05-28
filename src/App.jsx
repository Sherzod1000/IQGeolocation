import './App.css';
import { Button, Table, useTheme, Window } from '@iqueue/ui-kit';
import { useContext, useEffect, useState } from 'react';
import { AddNewLocationModal } from './components/AddNewLocationModal.jsx';
import { LocationContext } from './context/locationContext.jsx';
import { setIds } from './components/helper/functions.js';
import { DeleteLocationModal } from './components/DeleteLocationModal.jsx';
import { ShowMoreInfoModal } from './components/ShowMoreInfoModal.jsx';
import { filterByColumn, handleModalActions } from './helper/functions.js';

function App() {
  const [addNewLocationModal, setAddNewLocationModal] = useState(false);
  const [editLocationModal, setEditLocationModal] = useState(false);
  const [deleteLocationModal, setDeleteLocationModal] = useState(false);
  const [showMoreLocationModal, setShowMoreLocationModal] = useState(false);
  const { setTheme } = useTheme();
  const { locations } = useContext(LocationContext);
  const [currentLocation, setCurrentLocation] = useState({});
  useEffect(() => {
    setTheme('dark');
    setIds();
  }, []);

  const schema = [
    {
      key: 'location_name',
      title: 'Location Name',
      // width: '10rem',
      render: (a) => <h6>{a}</h6>,
      filter: filterByColumn('location_name'),
    },
    {
      key: 'country',
      title: 'Country',
      render: (a) => <h6>{a}</h6>,
      filter: filterByColumn('country'),
    },
    {
      key: 'city',
      title: 'City',
      render: (a) => <h6>{a}</h6>,
      filter: filterByColumn('city'),
    },
    {
      key: 'actions',
      width: '15rem',
      title: 'Actions',
      render: (key, value) => (
        <>
          <div className={'flex gap-1'}>
            <Button
              className={'grow text-nowrap'}
              secondary
              icon={'info'}
              onClick={() =>
                handleModalActions(
                  setCurrentLocation,
                  setShowMoreLocationModal,
                  value
                )
              }
            ></Button>
            <Button
              className={'grow text-nowrap'}
              caution
              icon={'edit'}
              onClick={() =>
                handleModalActions(
                  setCurrentLocation,
                  setEditLocationModal,
                  value
                )
              }
            ></Button>
            <Button
              className={'grow text-nowrap'}
              danger
              icon={'delete'}
              onClick={() =>
                handleModalActions(
                  setCurrentLocation,
                  setDeleteLocationModal,
                  value
                )
              }
            ></Button>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <Window title={'IQ Geolocation'}>
        <div className={'wrapper'}>
          <Table
            className={'overflow-x-scroll'}
            schema={schema}
            entries={locations.length ? locations : []}
            minWidth={'40rem'}
            indexable={true}
          />
          <Button
            className={'align-end'}
            primary
            onClick={() => setAddNewLocationModal((prev) => !prev)}
          >
            Add new location
          </Button>
        </div>
        <AddNewLocationModal
          isAdd={{
            isOpen: addNewLocationModal,
            setIsOpen: setAddNewLocationModal,
          }}
          isEdit={{
            data: currentLocation,
            isOpen: editLocationModal,
            setIsOpen: setEditLocationModal,
          }}
        />
        <DeleteLocationModal
          isOpen={deleteLocationModal}
          setIsOpen={setDeleteLocationModal}
          id={currentLocation?.id}
        />
        <ShowMoreInfoModal
          isOpen={showMoreLocationModal}
          setIsOpen={setShowMoreLocationModal}
          id={currentLocation?.id}
        />
      </Window>
    </>
  );
}

export default App;
