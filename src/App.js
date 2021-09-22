import './App.css';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Popup, Polyline } from 'react-leaflet';
import axios from 'axios';
import polyline from '@mapbox/polyline';
import Landing from './components/landing';
import MostRecent from './components/mostRecent';

import { GoThumbsup } from 'react-icons/go';
import { AiOutlineFieldTime, AiOutlineFieldNumber } from 'react-icons/ai';
import {
  GiPathDistance,
  GiSpeedometer,
  GiMountaintop,
  GiHeartBeats,
  GiMountainRoad,
} from 'react-icons/gi';
import { ImPower } from 'react-icons/im';

function App() {
  const clientId = `${process.env.REACT_APP_CLIENT_ID}`;
  const clientSecret = `${process.env.REACT_APP_CLIENT_SECRET}`;
  const refreshToken = `${process.env.REACT_APP_REFRESH_TOKEN}`;
  const activities_link =
    'https://www.strava.com/api/v3/athlete/activities?per_page=200&';
  const auth_link = 'https://www.strava.com/oauth/token';

  const [activities, setActivites] = useState(null); // initial capture of data

  const [nodes, setNodes] = useState([]); //used to set the popup and paths
  const [master, setMaster] = useState([]); // organized data for ease of navigation desired values

  useEffect(() => {
    async function fetchData() {
      const stravaAuthResponse = await axios.all([
        axios.post(
          `${auth_link}?client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`
        ),
      ]);
      const stravaActivityResponse = await axios.get(
        `${activities_link}access_token=${stravaAuthResponse[0].data.access_token}`
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

      const masterData = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const distanceTotal = stravaActivityResponse.data[i].distance;
        if (distanceTotal != null) {
          masterData.push({
            total_distance_travelled: stravaActivityResponse.data[i].distance,
            total_time_travelled: stravaActivityResponse.data[i].moving_time,
            total_elevation_change:
              stravaActivityResponse.data[i].total_elevation_gain,
            average_speed: stravaActivityResponse.data[i].average_speed,
            average_power: stravaActivityResponse.data[i].average_watts,
            average_time: stravaActivityResponse.data[i].elapsed_time,
            kudos_count: stravaActivityResponse.data[i].kudos_count,
          });
        }
      }
      setMaster(masterData);
    }
    fetchData();
  }, []);

  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);

    var hDisplay = h > 0 ? h + (h === 1 ? ' h, ' : ' h, ') : '';
    var mDisplay = m > 0 ? m + (m === 1 ? ' m, ' : ' m, ') : '';
    var sDisplay = s > 0 ? s + (s === 1 ? ' s' : ' s') : '';
    return hDisplay + mDisplay + sDisplay;
  }

  const [maximumDistance, setMaximumDistance] = useState([]);

  useEffect(() => {
    setMaximumDistance(
      master.sort(function (a, b) {
        return b.total_distance_travelled - a.total_distance_travelled;
      })
    );
  }, [master]);

  if (!activities || !nodes) return <span>Loading</span>;

  console.log(nodes);

  const masterActivities = master.length;

  const mostRecentDistance = (activities.data[0].distance / 1000).toFixed(2);
  const mostRecentTime = secondsToHms(activities.data[0].moving_time);
  const mostRecentElevation = activities.data[0].total_elevation_gain;
  const mostRecentKph = (activities.data[0].average_speed * 3.6).toFixed(2);
  const mostRecentHr = activities.data[0].average_heartrate;

  const previousRecentDistance = (activities.data[1].distance / 1000).toFixed(
    2
  );
  const previousRecentTime = secondsToHms(activities.data[1].moving_time);
  const previousRecentElevation = activities.data[1].total_elevation_gain;
  const previousRecentKph = (activities.data[1].average_speed * 3.6).toFixed(2);
  const previousRecentHr = activities.data[1].average_heartrate;

  const masterDistance = (
    master.reduce(function (a, b) {
      return a + b.total_distance_travelled;
    }, 0) / 1000
  ).toFixed(2);

  const timeTemp = master.reduce(function (a, b) {
    return a + b.total_time_travelled;
  }, 0);

  const masterTime = secondsToHms(timeTemp);
  const aveMasterTime = secondsToHms(timeTemp / masterActivities);

  const masterElevation = master
    .reduce(function (a, b) {
      return a + b.total_elevation_change;
    }, 0)
    .toFixed(2);

  const masterSpeed = (
    (master.reduce(function (a, b) {
      return a + b.average_speed;
    }, 0) /
      masterActivities) *
    3.6
  ).toFixed(2);

  const masterPower = (
    master.reduce(function (a, b) {
      return a + (b.average_power || 0);
    }, 0) / masterActivities
  ).toFixed(2);

  const masterKudos = master.reduce(function (a, b) {
    return a + b.kudos_count;
  }, 0);

  console.log(master);

  return (
    <div className="globalBody">
      <Landing />
      <div className="landingBackdrop"></div>

      <div className="App">
        <h1 id="recent" className="header">
          Most Recent Journey
        </h1>
        <div className="underline"></div>

        <MostRecent
          distance={mostRecentDistance}
          time={mostRecentTime}
          elevation={mostRecentElevation}
          kph={mostRecentKph}
          hr={mostRecentHr}
        />

        <h1 id="recent" className="header">
          Previous Journey
        </h1>
        <div className="underline"></div>

        <MostRecent
          distance={previousRecentDistance}
          time={previousRecentTime}
          elevation={previousRecentElevation}
          kph={previousRecentKph}
          hr={previousRecentHr}
        />

        <h1 id="stats" className="header">
          Total Stats
        </h1>
        <div className="underline"></div>

        <div className="cardsContainer">
          <div>
            <h1>
              <GiPathDistance />
            </h1>
            <p>Total Distance Travelled</p>
            <h2>{masterDistance}</h2>
            <code>kilometers</code>
          </div>

          <div>
            <h1>
              <AiOutlineFieldTime />
            </h1>
            <p>Total Time Riding</p>
            <h2>{masterTime}</h2>
            <code>hours, minutes, seconds</code>
          </div>

          <div>
            <h1>
              <AiOutlineFieldNumber />
            </h1>
            <p>Number of Tracked Activities</p>
            <h2>{masterActivities}</h2>
            <code>integer</code>
          </div>

          <div>
            <h1>
              <GiMountaintop />
            </h1>
            <p>Total Elevation Change</p>
            <h2>{masterElevation}</h2>
            <code>meters</code>
          </div>

          <div>
            <h1>
              <GiSpeedometer />
            </h1>
            <p>Average Speed</p>
            <h2>{masterSpeed}</h2>
            <code>kilometers per hour</code>
          </div>

          <div>
            <h1>
              <ImPower />
            </h1>
            <p>Average Power Output</p>
            <h2>{masterPower}</h2>
            <code>watts</code>
          </div>

          <div>
            <h1>
              <AiOutlineFieldTime />
            </h1>
            <p>Average Time Riding</p>
            <h2>{aveMasterTime}</h2>
            <code>hours, minutes, seconds</code>
          </div>

          <div>
            <h1>
              <GoThumbsup />
            </h1>{' '}
            <p>Total Kudos Received</p>
            <h2>{masterKudos}</h2>
            <code>integer</code>
          </div>

          <div>
            <h1>
              <GiPathDistance />
            </h1>
            <p>Longest Ride</p>
            <h2>
              {master.length > 1 &&
                (master[0].total_distance_travelled / 1000).toFixed(2)}
            </h2>
            <code>kilometers</code>
          </div>
        </div>

        <h1 className="header">Where I've Ridden</h1>
        <div className="underline"></div>

        <p style={{ textAlign: 'center' }}>Most recent Ride in Red</p>

        <div id="map" className="mapBox">
          {' '}
          <MapContainer
            center={[59.421746, 17.835788]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              accessToken="pk.eyJ1Ijoid2lraWRicml0IiwiYSI6ImNrdHJqcmIwMzEwdjQyb2w4YnVoZWtqeTkifQ.GqLFJGvPKNM1PNFBgSlEOw"
            />

            {nodes.map((activity, i) => (
              <Polyline
                key={i}
                positions={activity.activityPositions}
                className={'polyline' + [i]}
              >
                <Popup>
                  <div>
                    <h2>{activity.activity_name}</h2>
                    <h3>
                      {'Distance Travelled :' + activity.activity_distance} Km
                    </h3>
                    <h3>
                      {'Total Elevation :' + activity.activityHeight} meters
                    </h3>
                  </div>
                </Popup>
              </Polyline>
            ))}
            {nodes.length > 1 && (
              <Polyline
                key="0"
                positions={nodes[0].activityPositions}
                className="polyline0"
              >
                <Popup>
                  <div>
                    <h2>{nodes[0].activity_name}</h2>
                    <h3>
                      {'Distance Travelled :' + nodes[0].activity_distance} Km
                    </h3>
                    <h3>
                      {'Total Elevation :' + nodes[0].activityHeight} meters
                    </h3>
                  </div>
                </Popup>
              </Polyline>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
