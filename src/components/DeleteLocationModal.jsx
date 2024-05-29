import {Message, Modal, Span} from '@iqueue/ui-kit';
import {useContext} from 'react';
import {LocationContext} from '../context/locationContext.jsx';
import {ERROR_DELETE_MSG, SUCCESS_DELETE_MSG} from './helper/constants.js';

export function DeleteLocationModal({id, isOpen, setIsOpen}) {
  const {locations, setLocations} = useContext(LocationContext);

  async function handleDeleteLocation() {
    const cancelLoading = Message({
      type: 'loading',
      title: 'Loading...',
      timeout: 200000,
    });
    const response = new Promise((resolve) => {
      setIsOpen(false);
      setTimeout(() => {
        const filteredLocations = locations.filter(
          (location) => location.id !== id
        );
        setLocations(() => [...filteredLocations]);
        resolve({
          status: 200,
          statusText: 'OK',
          data: filteredLocations,
        });
      }, 1000);
    });
    response
      .then((res) => {
        if (res.status === 200) {
          setIsOpen(false);
          Message({
            type: 'success',
            title: SUCCESS_DELETE_MSG,
            timeout: 2000,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        Message({
          type: 'error',
          title: ERROR_DELETE_MSG,
          timeout: 2000,
        });
      })
      .finally(() => {
        cancelLoading();
        setIsOpen(false);
      });
  }

  return (
    <>
      <Modal
        isOpened={isOpen}
        onClose={() => setIsOpen(false)}
        footerActions={[
          {
            key: 'cancel',
            title: 'Cancel',
            primary: true,
          },
          {
            key: 'Delete',
            title: 'Delete',
            danger: true,
            onClick: handleDeleteLocation,
          },
        ]}
      >
        <Span
          style={{
            color: '#FF9806',
            textAlign: 'center',
            fontStyle: 'oblique',
          }}
        >
          Notice that after deleting the location, you cannot restore it again !
        </Span>
        <h6 className={'text-center'}>Are you sure to delete !</h6>
      </Modal>
    </>
  );
}
