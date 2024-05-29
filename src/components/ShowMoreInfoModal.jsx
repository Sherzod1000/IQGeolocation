import {Message, Modal, Span, Table} from '@iqueue/ui-kit';
import {useContext, useEffect, useState} from 'react';
import {LocationContext} from '../context/locationContext.jsx';
import {generateObjectWithValues, minimizeNumbersOfCoords,} from './helper/functions.js';

export function ShowMoreInfoModal({isOpen, setIsOpen, id}) {
  const {locations} = useContext(LocationContext);
  const [currentLocation, setCurrentLocation] = useState([]);
  const schema = [
    {
      key: 'location_key',
      title: 'Key',
      render: (a) => <Span>{a}</Span>,
    },
    {
      key: 'location_value',
      title: 'Value',
      render: (a) => <Span>{a}</Span>,
    },
  ];
  const entries = [
    {
      location_key: 'Country name',
      location_value: 'Canada',
    },
  ];
  useEffect(() => {
    if (id) {
      const current = locations?.find((location) => location?.id === id);
      if (!current) {
        Message({
          title: 'Something went wrong !',
          type: 'error',
          timeout: 2000,
        });
        setIsOpen(false);
        console.error(
          'Some error occurred, while finding the current location !'
        );
      }
      console.log(current);
      const keys = [
        'Location name',
        'Country',
        'City',
        'Short code',
        'Coordinates',
        'Buffer coordinates',
      ];
      const values = [
        current?.location_name,
        current?.country,
        current?.city,
        current?.features.at(-1).properties?.short_code || 'Unknown',
        JSON.stringify(
          minimizeNumbersOfCoords(
            current?.polygon?.[0].geometry.coordinates?.[0]
          )
        ),
        JSON.stringify(
          minimizeNumbersOfCoords(
            current?.bufferPolygon?.[0].geometry.coordinates?.[0]
          )
        ),
      ];

      setCurrentLocation(() => generateObjectWithValues(keys, values));
    }
  }, [id]);

  return (
    <>
      <Modal
        className={'pb-4'}
        isOpened={isOpen}
        onClose={() => setIsOpen(false)}
        footerActions={[
          {
            key: 'cancel',
            title: 'Close',
            danger: true,
            style: {
              marginLeft: 'auto',
              marginRight: 'auto',
              minWidth: '25rem',
            },
          },
        ]}
      >
        <Table
          minWidth={'30rem'}
          schema={schema}
          entries={currentLocation || entries}
          style={{margin: '0.5rem'}}
        />
      </Modal>
    </>
  );
}
