import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function RSVPScreening() {
    const [screenings, setScreenings] = useState([]);
    const [selectedScreening, setSelectedScreening] = useState("");
  
    // Fetch the screenings from the backend when the component mounts
    useEffect(() => {
      async function fetchScreenings() {
        try {
          const res = await fetch('/screenings');
          if (res.ok) {
            const data = await res.json();
            setScreenings(data);
          } else {
            console.error('Failed to fetch screenings.');
          }
        } catch (err) {
          console.error('Error fetching screenings:', err);
        }
      }
      fetchScreenings();
    }, []);
  
    const handleRSVP = async () => {
      if (!selectedScreening) {
        alert('Please select a screening first.');
        return;
      }
      
      try {
        const res = await fetch('/rsvps', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
      
         
          body: JSON.stringify({
            screening_id: selectedScreening
          }),
        });
        
        if (res.ok) {
          alert('RSVP successfully submitted!');
        } else {
          const errorData = await res.json();
          alert('Error submitting RSVP: ' + errorData.error);
        }
      } catch (err) {
        console.error('Error submitting RSVP:', err);
        alert('An error occurred while submitting RSVP.');
      }
    };
    return (
        <div style={{ padding: 20 }}>
          <h2>RSVP for a Screening</h2>
          <select
            value={selectedScreening}
            onChange={(e) => setSelectedScreening(e.target.value)}
          >
            <option value="">-- Select a screening --</option>
            {screenings.map((screening) => {
              // Format the screening_date (assumed to be an ISO date string) to "Month Day, Year"
              const formattedDate = new Date(screening.screening_date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              });
              return (
                <option key={screening.id} value={screening.id}>
                  {screening.movie_title} at {screening.venue_name} on {formattedDate} at {screening.screening_time}
                </option>
              );
            })}
          </select>
          <button onClick={handleRSVP} style={{ marginLeft: 10 }}>
            RSVP
          </button>
        </div>
    );
      
      
  }
  