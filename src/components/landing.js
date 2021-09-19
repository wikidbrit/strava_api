import React from 'react';
import bike from '../images/DualSport2Blur.png'

export default function Landing() {
  return (
    <div className="landingBackground">{' '}
      <div className="landingWrapper">
          <h3>Personal Strava Dashboard</h3>
          <nav>
              <p>STATS</p>
              <p>CONTACT</p>
          </nav>
          <img src={bike} alt='Trek Dual Sport 2 Bicycle'></img>
          <h1 classname='tre'>TRE</h1>
          <h4>Journeys Around Jarfalla</h4>
          <h1 className='kkie'>KKIE</h1>
      </div>
    </div>
  );
}
