import { Button, Col, Layout, Row, Table } from "@iqueue/ui-kit";
import { filterByColumn, handleModalActions } from "../../helper/functions.js";
import { AddNewLocationModal } from "../AddNewLocationModal.jsx";
import { DeleteLocationModal } from "../DeleteLocationModal.jsx";
import { ShowMoreInfoModal } from "../ShowMoreInfoModal.jsx";
import { useContext, useRef, useState } from "react";
import { LocationContext } from "../../context/locationContext.jsx";

export function LocationTableView() {
  const tableRef = useRef();
  const [addNewLocationModal, setAddNewLocationModal] = useState(false);
  const [editLocationModal, setEditLocationModal] = useState(false);
  const [deleteLocationModal, setDeleteLocationModal] = useState(false);
  const [showMoreLocationModal, setShowMoreLocationModal] = useState(false);
  const { locations } = useContext(LocationContext);
  const [currentLocation, setCurrentLocation] = useState({});
  const schema = [
    {
      key: "location_name",
      title: "Location Name",
      // width: '10rem',
      filter: filterByColumn("location_name"),
    },
    {
      key: "country",
      title: "Country",
      filter: filterByColumn("country"),
    },
    {
      key: "city",
      title: "City",
      filter: filterByColumn("city"),
    },
    {
      key: "actions",
      title: "Actions",
      scope: "table",
      render: (key, value) => (
        <>
          <div className={"flex gap-1"}>
            <Button
              className={"grow text-nowrap"}
              caution
              id={"editLocationModal"}
              icon={"edit"}
              onClick={() =>
                handleModalActions(
                  setCurrentLocation,
                  setEditLocationModal,
                  value,
                )
              }
            ></Button>
            <Button
              className={"grow text-nowrap"}
              id={"deleteLocationModal"}
              danger
              icon={"delete"}
              onClick={() =>
                handleModalActions(
                  setCurrentLocation,
                  setDeleteLocationModal,
                  value,
                )
              }
            ></Button>
          </div>
        </>
      ),
    },
  ];
  return (
    <Row>
      <Layout vertical={true}>
        <Col size={12}>
          <Table
            ref={tableRef}
            className={"overflow-x-scroll"}
            schema={schema}
            entries={locations.length ? locations : []}
            onRowClick={(value, event) => {
              if (
                event.target.id !== "editLocationModal" &&
                event.target.id !== "deleteLocationModal"
              ) {
                handleModalActions(
                  setCurrentLocation,
                  setShowMoreLocationModal,
                  value,
                );
              }
            }}
            minWidth={"60rem"}
            indexable={true}
          />
        </Col>
        <Col>
          <Row justify={"end"} spacing={20}>
            <Button
              className={"align-end"}
              primary
              onClick={() => {
                setAddNewLocationModal((prev) => !prev);
              }}
            >
              Add new location
            </Button>
          </Row>
        </Col>
      </Layout>
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
    </Row>
  );
}
