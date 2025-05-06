import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrganizerReports() {
    const navigate = useNavigate();

    const goToPopularityGenreReport = () => {
        navigate('/popularity-genre-report');
    }
  
    const goToDetailedScreeningReport = () => {
        navigate('/detailed-screening-report');
    }


    return (
        <div style={{ padding: 20 }}>
          <h1>Organizer Reports</h1>
          <button onClick={goToDetailedScreeningReport} style={{ marginRight: 10 }}>
            Detailed Screening Report
          </button>
          <button onClick={goToPopularityGenreReport} style={{ marginRight: 10 }}>
            Film Popularity and Genre Breakdown Report
          </button>
        </div>
      );
    
}


