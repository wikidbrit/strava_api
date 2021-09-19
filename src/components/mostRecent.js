import React from 'react'
import "../styles/mostRecent.css"
import { GiPathDistance, GiSpeedometer, GiMountaintop, GiHeartBeats } from 'react-icons/gi'
import { AiOutlineFieldTime } from 'react-icons/ai'


export default function MostRecent(props) {
    return (
        <div className='mostRecentActivity'>
            <div className='distanceBlock block'>
                <h1><GiPathDistance/> </h1>
                <p>Distance Travelled</p>
                <h2>{props.distance}</h2>
                <code>kilometers</code>
            </div>
            <div className='timeBlock block'>
                <h1><AiOutlineFieldTime/></h1>
                <p>Time Out</p>
                <h2>{props.time}</h2>
                <code>hours, minutes, seconds</code>
            </div>
            <div className='elevationBlock block'>
                <h1><GiMountaintop /></h1>
                <p>Elevation Change</p>
                <h2>{props.elevation}</h2>
                <code>meters</code>
            </div>
            <div className='kphBlock block'>
                <h1><GiSpeedometer/></h1>
                <p>Average Speed</p>
                <h2>{props.kph}</h2>
                <code>kilometers per hour</code>
            </div>
            <div className='hrBlock block'>
                <h1><GiHeartBeats/></h1>
                <p>Average Heart Rate</p>
                <h2>{props.hr}</h2>
                <code>beats per minute</code>
            </div>
        </div>
    )
}
