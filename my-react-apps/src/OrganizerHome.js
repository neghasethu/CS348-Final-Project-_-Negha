import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrganizerHome() {
    const navigate = useNavigate();

    const goToAddMovie = () => {
        navigate('/add-movie');
    }
    const goToAddVenue = () => {
        navigate('/add-venue');
    }
    const goToScreening = () => {
        navigate('/screenings');
    }
    const goToOrganizerReports = () => {
        navigate('/organizer-reports')
    }
    

    return (
        <div style={{ padding: 20 }}>
          <h1>Organizer Dashboard</h1>
          <button onClick={goToAddMovie} style={{ marginRight: 10 }}>
            Add a Movie
          </button>
          <button onClick={goToAddVenue} style={{ marginRight: 10 }}>
            Add a Venue
          </button>
          <button onClick={goToScreening} style={{ marginRight: 10 }}>
            Screenings
          </button>
          <button onClick={goToOrganizerReports} style={{ marginRight: 10 }}>
            Generate Customized Reports
          </button>
    
        </div>
      );
    
}