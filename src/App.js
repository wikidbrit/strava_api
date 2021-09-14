import "./App.css";
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import axios from "axios";
import polyline from "@mapbox/polyline";

function App() {
  const clientID = "69933";
  const clientSecret = "04083840517d81363be5a52c12d810600fa03c02";
  const refreshToken = "0c739bf6cf0fe25c9f6d56d323025abe5a1e1559";
  const activities_link = "https://www.strava.com/api/v3/athlete/activities";
  const auth_link = "https://www.strava.com/oauth/token";

  const [activities, setActivites] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [distance, setDistance] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const stravaAuthResponse = await axios.all([
        axios.post(
          `${auth_link}?client_id=${clientID}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`
        ),
      ]);
      const stravaActivityResponse = await axios.get(
        `${activities_link}?access_token=${stravaAuthResponse[0].data.access_token}`
      );
      setActivites(stravaActivityResponse);

      const polylines = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const activity_polyline =
          stravaActivityResponse.data[i].map.summary_polyline;
        const activity_name = stravaActivityResponse.data[i].name;
        const activity_elevation =
          stravaActivityResponse.data[i].total_elevation_gain;
        const activity_distance = (
          stravaActivityResponse.data[i].distance / 1000
        ).toFixed(2);

        if (activity_polyline != null) {
          polylines.push({
            activityPositions: polyline.decode(activity_polyline),
            activity_name: activity_name,
            activityHeight: activity_elevation,
            activity_distance: activity_distance,
          });
        }
      }
      setNodes(polylines);

      const totalDistance = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const distanceTotal = stravaActivityResponse.data[i].distance;
        if (distanceTotal != null) {
          totalDistance.push({
            total_distance_travelled: stravaActivityResponse.data[i].distance,
          });
        }
      }
      setDistance(totalDistance);
    }
    fetchData();
  }, []);

  const distanceSum = distance.reduce(function (prev, current) {
    return prev + +current.total_distance_travelled;
  }, 0);
  console.log(distanceSum);

  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);

    var hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay;
  }

  if (!activities) return <span>Loading</span>;

  const mostRecentDistance = (activities.data[0].distance / 1000).toFixed(2);
  const mostRecentTime = secondsToHms(activities.data[0].moving_time);
  const mostRecentElevation = activities.data[0].total_elevation_gain;
  const mostRecentKph = activities.data[0].average_speed * 3.6;

  return (
    <>
      <div className="App">
        <h1>Personal Strava Dashboard</h1>
        <p>{mostRecentDistance + " m"}</p>
        <p>{mostRecentTime}</p>
        <p>{mostRecentElevation + " m"}</p>
        <p>{mostRecentKph + " kph"}</p>

        <h2>{"Total Distance Travelled: " + (distanceSum / 1000).toFixed(2) + " km"}</h2>
        <MapContainer
          center={[59.421746, 17.835788]}
          zoom={13}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          />

          {nodes.map((activity, i) => (
            <Polyline key={i} positions={activity.activityPositions}>
              <Popup>
                <div>
                  <h1>{activity.activity_name}</h1>
                  <h2>
                    {"Total Elevation :" + activity.activityHeight} meters
                  </h2>
                  <h2>
                    {"Distance Travelled :" + activity.activity_distance} Km
                  </h2>
                </div>
              </Popup>
            </Polyline>
          ))}
        </MapContainer>
      </div>
    </>
  );
}

export default App;
