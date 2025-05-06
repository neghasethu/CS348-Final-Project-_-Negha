import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function ScreeningsOptions() {
    const navigate = useNavigate();
    const goToAddScreening = () => {
        navigate('/schedule-screening');
    }

    const goToUpdateScreening = () => {
        navigate('/update-screening');
    }

    const goToDeleteScreening = () => {
         navigate('/delete-screening');
    }
  
    const goToViewRSVP = () => {
      navigate('/view-rsvp');
   }
  

    return (
        <div style={{ padding: 20 }}>
          <h1>Screenings</h1>
          <button onClick={goToAddScreening} style={{ marginRight: 10 }}>
            Add a Screening
          </button>
          <button onClick={goToUpdateScreening} style={{ marginRight: 10 }}>
            Update a Screening
          </button> 
          <button onClick={goToDeleteScreening} style={{ marginRight: 10 }}>
            Delete a Screening
          </button> 
          <button onClick={goToViewRSVP}>
            View RSVPs for Screenings
          </button>
        </div>
      );
    
}