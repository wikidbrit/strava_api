import "./App.css";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import tesla from "./data/tesla.json";

function App() {
  const filteredStations = tesla.filter(tsla => tsla.address.country === 'Sweden')

  return (
    <div className="App">
      <h1>Hello Woot</h1>

      <MapContainer center={[59.334591, 18.063240]} zoom={6} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredStations.map((test) => (
          <Marker 
          key={test.id}
          position={[test.gps.latitude, test.gps.longitude]}
          >

            <Popup position={[test.gps.latitude, test.gps.longitude]}>
              <div>
                <h2>{"Name: " + test.name}</h2>
                <p>{"Status: " + test.status}</p>
                <p>{"Stall Count: " + test.stallCount}</p>
              </div>
            </Popup>

          </Marker>

        ))}
      </MapContainer>
    </div>
  );
}

export default App;
