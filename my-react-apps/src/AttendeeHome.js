import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AttendeeHome() {
    const navigate = useNavigate();

    const goToRSVPScreening = () => {
        navigate('/rsvp-screening');
    }
  
    const goToAttendeeReport = () => {
        navigate('/screening-report');
    }

    const goToExploreMovies = () => {
      navigate('/explore-movies');
   }


    

    return (
        <div style={{ padding: 20 }}>
          <h1>Attendee Dashboard</h1>
          <button onClick={goToRSVPScreening} style={{ marginRight: 10 }}>
            Explore Screenings
          </button>
          <button onClick={goToAttendeeReport} style={{ marginRight: 10 }}>
            Generate Screening Report
          </button>
          <button onClick={goToExploreMovies} style={{ marginRight: 10 }}>
            Explore the Movies!
          </button>
        </div>
      );
    
}


