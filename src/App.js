import "./App.css";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Popup, Polyline } from "react-leaflet";
import axios from "axios";
import polyline from "@mapbox/polyline";

//Code is in dire need of refactoring, due to the time constraints I just pushed forward to have 
//something to deploy. If time permits I will return to this project in the future. The focus of this project was
//to write and learn about useState and useEffect, hense the number of functions and states declared. 
//Most of the useState I now realize can be abandoned and I can refer to the original query with conditional
//rendering to display the content.

//Make a new useState that will be mapped for the component rendering.

function App() {
  const clientId = `${process.env.REACT_APP_CLIENT_ID}`;
  const clientSecret = `${process.env.REACT_APP_CLIENT_SECRET}`;
  const refreshToken = `${process.env.REACT_APP_REFRESH_TOKEN}`;
  const activities_link = "https://www.strava.com/api/v3/athlete/activities?per_page=200&";
  const auth_link = "https://www.strava.com/oauth/token";

  const [activities, setActivites] = useState(null);
  const [nodes, setNodes] = useState([]);


  const [totalActivities, setTotalActivies] = useState([])

  const [speed, setSpeed] = useState([])
  const [power, setPower] = useState([])

  const [kudos, setKudos] = useState([])


  const [master, setMaster] = useState([])

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

      const masterData = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const distanceTotal = stravaActivityResponse.data[i].distance;
        if (distanceTotal != null) {
          masterData.push({
            total_distance_travelled: stravaActivityResponse.data[i].distance,
            total_time_travelled: stravaActivityResponse.data[i].moving_time,
            total_elevation_change: stravaActivityResponse.data[i].total_elevation_gain,
            average_speed: stravaActivityResponse.data[i].average_speed,
            average_power: stravaActivityResponse.data[i].average_watts,
            average_time: stravaActivityResponse.data[i].elapsed_time,
            kudos_count: stravaActivityResponse.data[i].kudos_count,
          });
        }
      }
      setMaster(masterData);
  

      setTotalActivies(stravaActivityResponse.data.length)

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

  const [maximumDistance, setMaximumDistance] = useState([])

  useEffect(() => {
    setMaximumDistance(master.sort(function (a, b) {
    return b.total_distance_travelled - a.total_distance_travelled
  }
  )
  )
}, [master])

  if (!activities) return <span>Loading</span>;

  const mostRecentDistance = (activities.data[0].distance / 1000).toFixed(2);
  const mostRecentTime = secondsToHms(activities.data[0].moving_time);
  const mostRecentElevation = activities.data[0].total_elevation_gain;
  const mostRecentKph = activities.data[0].average_speed * 3.6;
  const mostRecentHr = activities.data[0].average_heartrate;

  const masterDistance =  (master.reduce(function (a,b) {
    return a + b.total_distance_travelled
  }, 0) / 1000).toFixed(2);

  const timeTemp = master.reduce(function (a,b){
    return a + b.total_time_travelled
  }, 0)

  const masterTime = secondsToHms(timeTemp)
  const aveMasterTime = secondsToHms(timeTemp / totalActivities)

  const masterElevation = (master.reduce(function (a,b) {
    return a + b.total_elevation_change
  }, 0)).toFixed(2)

  console.log(master)

  return (
    <>
      <div className="App">
        <h1>Personal Strava Dashboard</h1>
        <h2>Most Recent Ride</h2>
        <p>{mostRecentHr + " bpm"}</p>
        <p>{mostRecentDistance + " m"}</p>
        <p>{mostRecentTime}</p>
        <p>{mostRecentElevation + " m"}</p>
        <p>{(mostRecentKph).toFixed(2) + " kph"}</p>

        <hr></hr>

        <h2>{"Total Distance Travelled: " + masterDistance + " km"}</h2>
        <h2>{"Total Time on Bike: " + masterTime }</h2>
        <h2>{"Total Number of Tracked Activities: " + totalActivities}</h2>
        <h2>{"Total Elevation Changed: " + masterElevation + " m"}</h2>
        <h2>{"Average Speed: " + ((speedSum / totalActivities)*3.6).toFixed(2) + " kph"}</h2>
        <h2>{"Average Power Output in Watts: " + (powerSum / totalActivities).toFixed(2) + " watts"}</h2>
        <h2>{"Average Time each Ride: " + aveMasterTime}</h2>
        <h2>{"Total Kudos Received: " + kudosSum}</h2>
        <h2>{maximumDistance.length > 1 && "Max Ride Distance: " + ((maximumDistance[0].total_distance_travelled) / 1000).toFixed(2) + " km"}</h2>

        <MapContainer
          center={[59.421746, 17.835788]}
          zoom={13}
          scrollWheelZoom={false}
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