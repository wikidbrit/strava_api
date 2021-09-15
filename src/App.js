import "./App.css";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Popup, Polyline } from "react-leaflet";
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
  const [time, setTime] = useState([])
  const [totalActivities, setTotalActivies] = useState([])
  const [elevation, setElevation] = useState([])
  const [speed, setSpeed] = useState([])
  const [power, setPower] = useState([])
  const [aveTime, setAveTime] = useState([])
  const [kudos, setKudos] = useState([])

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

      //Polylines for Map

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

      //Total Distance Calculation

      const totalDistance = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const distanceTotal = stravaActivityResponse.data[i].distance;
        if (distanceTotal != null) {
          totalDistance.push({
            total_distance_travelled: (
              stravaActivityResponse.data[i].distance / 1000
            ).toFixed(2),
          });
        }
      }
      setDistance(totalDistance);


      //Total Time on Bike Calculation - Converted before Loading Return

      const totalTime = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const timeTotal = stravaActivityResponse.data[i].moving_time;
        if (timeTotal != null) {
          totalTime.push({
            total_time_travelled: 
              stravaActivityResponse.data[i].moving_time,
          });
        }
      }
      setTime(totalTime);

      //Catching and setting total activities tracked
    

      setTotalActivies(stravaActivityResponse.data.length)

      //Total elevation changes
      const totalElevation = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const elevationTotal = stravaActivityResponse.data[i].total_elevation_gain;
        if (elevationTotal != null) {
          totalElevation.push({
            total_elevation_change: 
              stravaActivityResponse.data[i].total_elevation_gain,
          });
        }
      }
      setElevation(totalElevation);

      //Calculation Average Speed

      const totalSpeed = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const speedTotal = stravaActivityResponse.data[i].average_speed;
        if (speedTotal != null) {
          totalSpeed.push({
            average_speed: 
              stravaActivityResponse.data[i].average_speed,
          });
        }
      }
      setSpeed(totalSpeed);

      //Calculation Average Power in Watts


      const totalPower = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const powerTotal = stravaActivityResponse.data[i].average_watts;
        if (powerTotal != null) {
          totalPower.push({
            average_power: 
              stravaActivityResponse.data[i].average_watts,
          });
        }
      }
      setPower(totalPower);

      //Calculation Average Time

      const totalAveTime = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const aveTimeTotal = stravaActivityResponse.data[i].elapsed_time;
        if (aveTimeTotal != null) {
          totalAveTime.push({
            average_time: 
              stravaActivityResponse.data[i].elapsed_time,
          });
        }
      }
      setAveTime(totalAveTime);

      //Calculation total Kudos

      const totalKudos = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const kudosTotal = stravaActivityResponse.data[i].kudos_count;
        if (kudosTotal != null) {
          totalKudos.push({
            kudos_count: 
              stravaActivityResponse.data[i].kudos_count,
          });
        }
      }
      setKudos(totalKudos);

      
    }
    fetchData();
  }, []);

  //Sum of Distance Travelled

  const distanceSum = distance.reduce(function (prev, current) {
    return prev + +current.total_distance_travelled;
  }, 0);

  //Sum of Elevation Gained

  const elevationSum = elevation.reduce(function (prev, current) {
    return prev + +current.total_elevation_change;
  }, 0);

  //Average Speed Calculation

  const speedSum = speed.reduce(function (prev, current){
    return prev + +current.average_speed;
  }, 0);

  // Average Power Calculation 

  const powerSum = power.reduce(function(prev, current) {
    return prev + +current.average_power
  }, 0)

  //Total Kudos Calculation

  const kudosSum = kudos.reduce(function(prev, current) {
    return prev + +current.kudos_count
  }, 0)

  const max = distance.sort(function (a, b) {
    return b.total_distance_travelled - a.total_distance_travelled
  })

  // function to convert number of seconds to a hour minute second format

  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);

    var hDisplay = h > 0 ? h + (h === 1 ? " h, " : " h, ") : "";
    var mDisplay = m > 0 ? m + (m === 1 ? " m, " : " m, ") : "";
    var sDisplay = s > 0 ? s + (s === 1 ? " s" : " s") : "";
    return hDisplay + mDisplay + sDisplay;
  }

  //Set Most Recent Time Calculation

  const timeSum = time.reduce(function (prev, current) {
    return prev + +current.total_time_travelled;
  }, 0);
  const timeSumTotal = secondsToHms(timeSum)

  //Set Total Average Time Calculation

  const totalTimeSum = aveTime.reduce(function (prev, current) {
    return prev + +current.average_time
  }, 0)

  const totalAveTimeSum = (totalTimeSum / totalActivities)
  const hmsTotalAveTimeSum = secondsToHms(totalAveTimeSum)

  if (!activities) return <span>Loading</span>;

  const mostRecentDistance = (activities.data[0].distance / 1000).toFixed(2);
  const mostRecentTime = secondsToHms(activities.data[0].moving_time);
  const mostRecentElevation = activities.data[0].total_elevation_gain;
  const mostRecentKph = activities.data[0].average_speed * 3.6;

  const everest = 8849;

  return (
    <>
      <div className="App">
        <h1>Personal Strava Dashboard</h1>
        <p>{mostRecentDistance + " m"}</p>
        <p>{mostRecentTime}</p>
        <p>{mostRecentElevation + " m"}</p>
        <p>{mostRecentKph + " kph"}</p>

        <h2>{"Total Distance Travelled: " + (distanceSum).toFixed(2) + " km"}</h2>
        <h2>{"Total Time on Bike: " + timeSumTotal }</h2>
        <h2>{"Total Number of Tracked Activities: " + totalActivities}</h2>
        <h2>{"Total Elevation Gained: " + elevationSum + " m"}</h2>
        <h2>{"Average Speed: " + (((speedSum / totalActivities)*3.6).toFixed(2)) + " kph"}</h2>
        <h2>{"Average Power Output in Watts: " + (powerSum / totalActivities).toFixed(2) + " watts"}</h2>
        <h2>{"Average Time each Ride: " + hmsTotalAveTimeSum}</h2>
        <h2>{"Total Kudos Received: " + kudosSum}</h2>
        <h2>{"Max Ride Distance: " + (max[0].total_distance_travelled) + " km"}</h2>

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
                  <h2>{activity.activity_name}</h2>
                  <h3>
                    {"Distance Travelled :" + activity.activity_distance} Km
                  </h3>
                  <h3>
                    {"Total Elevation :" + activity.activityHeight} meters
                  </h3>

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
