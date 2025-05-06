import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import OrganizerHome from './OrganizerHome';
import ScreeningsOptions from './ScreeningsOptions';
import ForgotPassword from './ForgotPassword';
import RSVPScreening from './RSVPscreening';
import AttendeeHome from './AttendeeHome';
import ExploreMovies from './ExploreMovies';
import OrganizerRSVPReport from './OrganizerRSVPReport';
import './App.css';
import ScreeningReport from './ScreeningReport';
import OrganizerReports from './OrganizerReports';
import DetailedScreeningReport from './DetailedScreeningReport';
import PopularityGenreReport from './PopularityGenreReport';
  // Create this component
//import ViewRSVP from './ViewRSVP';   

function RoleSelect() {
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    // Navigate to the signup page and pass the role as state
    navigate('/login', { state: { role } });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome!</h1>
      <button onClick={() => handleRoleClick('attendee')} style={{ marginRight: 10 }}>
        I’m an Attendee
      </button>
      <button onClick={() => handleRoleClick('organizer')}>
        I’m an Organizer
      </button>
    </div>
  );

}

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const location                = useLocation();
  const navigate                = useNavigate();
  // 'attendee' or 'organizer'
  const roleFromState           = location.state?.role || 'attendee';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/login', {
        method: 'POST',
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          email,
          password,
          portal: roleFromState,    // <--- send the portal
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        console.log("Logged in:", data);
        // Redirect based on portal
        if (roleFromState === 'attendee') {
          navigate('/attendee-home');
        } else {
          navigate('/organizer-home');
        }
      } else {
        // Show backend's error message (403 if wrong portal, 401 if bad creds, etc.)
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error("Error logging in:", err);
      setError('An error occurred. Please try again.');
    }
  };

  const goToSignup = () => {
    navigate('/signup', { state: { role: roleFromState } });
  };
  const goToForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login ({roleFromState.charAt(0).toUpperCase() + roleFromState.slice(1)})</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ marginRight: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ marginRight: 8 }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ marginRight: 8 }}>Login</button>
      </form>
      <div style={{ marginTop: 10 }}>
        <button onClick={goToForgotPassword} style={{ marginRight: 8 }}>
          Forgot Password
        </button>
        <button onClick={goToSignup}>
          Sign Up
        </button>
      </div>
    </div>
  );
}


function Signup() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const roleFromState = location.state?.role || 'attendee';

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;
    await fetch('/users', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name, email, password, role:roleFromState }),
    });
    if (roleFromState === 'attendee') {
      navigate('/attendee-home');
    } else if (roleFromState === 'organizer') {
      navigate('/organizer-home');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <h2>Sign Up</h2>
      <p>Your role: {roleFromState}</p>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Submit</button>
    </form>
  );
}


function AddVenue() {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Build the payload; ensure capacity is an integer
    const payload = {
      name,
      capacity: parseInt(capacity),
      address,
    };

    try {
      const response = await fetch('/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Venue "${data.name}" added successfully!`);
        // Clear the form fields
        setName('');
        setCapacity('');
        setAddress('');
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding venue:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Venue</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input 
            type="text" 
            placeholder="Venue Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ marginRight: 8 }}
          />
          <input 
            type="number" 
            placeholder="Capacity" 
            value={capacity} 
            onChange={(e) => setCapacity(e.target.value)} 
            required 
            style={{ marginRight: 8 }}
          />
          <input 
            type="text" 
            placeholder="Address (optional)" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <button type="submit">Add Venue</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}



function AddMovie() {
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [genre, setGenre] = useState('');
  const [runtime, setRuntime] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Build the payload and ensure numeric values are converted appropriately
    const payload = {
      title,
      director,
      genre,
      runtime: parseInt(runtime, 10),
      release_year: parseInt(year, 10),
      description
    };

    const response = await fetch('/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setTitle('');
      setDirector('');
      setGenre('');
      setRuntime('');
      setYear('');
      setDescription('');
      alert('Movie added successfully!');
    } else {
      alert('Error adding movie.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <h2>Add Movie</h2>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        placeholder="Director(s)"
        value={director}
        onChange={(e) => setDirector(e.target.value)}
        required
      />
      <input
        placeholder="Genre"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Runtime (minutes)"
        value={runtime}
        onChange={(e) => setRuntime(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Year"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        required
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
}



function ScheduleScreening() {
  const [movieID, setMovieID] = useState('');
  const [movies, setMovies] = useState([]);
  const [venueID, setVenueID] = useState(''); // Changed from venueName to venueID
  const [venues, setVenues] = useState([]);
  const [screeningDate, setScreeningDate] = useState('');
  const [screeningTime, setScreeningTime] = useState('');

  // Fetch movies when the component mounts
  useEffect(() => {
    async function fetchMovies() {
      const res = await fetch('/movies');
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      } else {
        console.error('Failed to fetch movies.');
      }
    }
    fetchMovies();
  }, []);

  // Fetch venues when the component mounts
  useEffect(() => {
    async function fetchVenues() {
      const res = await fetch('/venues');
      if (res.ok) {
        const data = await res.json();
        setVenues(data);
      } else {
        console.error('Failed to fetch venues.');
      }
    }
    fetchVenues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure required fields are provided (movie, venue, date, time)
    if (!movieID || !venueID || !screeningDate.trim() || !screeningTime.trim()) return;

    const response = await fetch('/schedule-screening', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movie_id: movieID,
        venue_id: venueID,  // now using venue_id
        screening_date: screeningDate,
        screening_time: screeningTime,
      }),
    });

    if (response.ok) {
      alert('Screening scheduled successfully!');
      // Clear form fields
      setMovieID('');
      setVenueID('');
      setScreeningDate('');
      setScreeningTime('');
    } else {
      alert('Error scheduling screening.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Schedule a Screening</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="movie">Select Movie:</label>
          <select
            id="movie"
            value={movieID}
            onChange={(e) => setMovieID(e.target.value)}
            required
            style={{ marginLeft: 10 }}
          >
            <option value="">-- Select a movie --</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title} ({movie.release_year})
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 10 }}>
          <label htmlFor="venue">Select Venue:</label>
          <select
            id="venue"
            value={venueID}
            onChange={(e) => setVenueID(e.target.value)}
            required
            style={{ marginLeft: 10 }}
          >
            <option value="">-- Select a venue --</option>
            {venues.map((venue) => (
              <option key={venue.venue_id} value={venue.venue_id}>
                {venue.name} (Capacity: {venue.capacity})
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 10 }}>
          <input
            type="date"
            placeholder="Screening Date"
            value={screeningDate}
            onChange={(e) => setScreeningDate(e.target.value)}
            required
            style={{ marginRight: 8 }}
          />
          <input
            type="time"
            placeholder="Screening Time"
            value={screeningTime}
            onChange={(e) => setScreeningTime(e.target.value)}
            required
            style={{ marginRight: 8 }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="submit">Schedule Screening</button>
        </div>
      </form>
    </div>
  );
}





function DeleteScreening({ onDelete }) {
  const [screeningId, setScreeningId] = useState('');
  const handleDelete = async () => {
      if (!screeningId) return;

      const confirmDelete = window.confirm("Are you sure you want to delete this screening?");
      if (!confirmDelete) return;

      try {
          const response = await fetch(`/screenings/${screeningId}`, {
          method: 'DELETE'
      });

      if (response.ok) {
          alert('Screening deleted successfully');
         
          if (onDelete) onDelete(screeningId);
          } else {
              const errorData = await response.json();
              alert('Error: ' + errorData.error);
          }
      } catch (error) {
          console.error('Error deleting screening:', error);
          alert('An error occurred while deleting the screening.');
      }
  };

  return (
      <form onSubmit={handleDelete} style={{ padding: 20 }}>
        <h2>Delete Screening</h2>
        <input
          type="text"
          placeholder="Enter Screening ID"
          value={screeningId}
          onChange={e => setScreeningId(e.target.value)}
          style={{ marginRight: 8 }}
          required
        />
        <button type="submit">Delete Screening</button>
      </form>
  );
}



function BrowseMovies() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch('/movies')
      .then(res => res.json())
      .then(setMovies);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Available Movies</h2>
      <select>
        <option value="">-- Select a movie --</option>
        {movies.map(m => (
          <option key={m.id} value={m.id}>
            {m.title} ({m.release_year}) — {m.director}
          </option>
        ))}
      </select>
    </div>
  );
}


function UpdateScreening() {
  const [screeningId, setScreeningId] = useState('');
  const [movieID, setMovieID] = useState('');
  const [venueID, setVenueID] = useState('');
  const [screeningDate, setScreeningDate] = useState('');
  const [screeningTime, setScreeningTime] = useState('');
  const [movies, setMovies] = useState([]);
  const [venues, setVenues] = useState([]);
  const [status, setStatus] = useState('');

  // Fetch movies and venues when the component mounts
  useEffect(() => {
    async function fetchMovies() {
      const res = await fetch('/movies');
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      } else {
        console.error('Failed to fetch movies.');
      }
    }
    async function fetchVenues() {
      const res = await fetch('/venues');
      if (res.ok) {
        const data = await res.json();
        setVenues(data);
      } else {
        console.error('Failed to fetch venues.');
      }
    }
    fetchMovies();
    fetchVenues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screeningId.trim()) {
      alert("Please enter a screening ID.");
      return;
    }
    
    // Build payload with provided fields
    const payload = {};
    if (movieID) payload.movie_id = movieID;
    if (venueID) payload.venue_id = venueID;
    if (screeningDate.trim()) payload.screening_date = screeningDate;
    if (screeningTime.trim()) payload.screening_time = screeningTime;
    if (status) payload.status = status;
    
    const response = await fetch(`/screenings/${screeningId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (response.ok) {
      const updatedScreening = await response.json();
      alert("Screening updated successfully!");
 
      setScreeningId('');
      setMovieID('');
      setVenueID('');
      setScreeningDate('');
      setScreeningTime('');
      setStatus('');
      console.log(updatedScreening);
    } else {
      const errorData = await response.json();
      alert("Error updating screening: " + errorData.error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Update Screening</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Screening ID"
            value={screeningId}
            onChange={(e) => setScreeningId(e.target.value)}
            required
            style={{ marginRight: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label htmlFor="movie">Select New Movie:</label>
          <select
            id="movie"
            value={movieID}
            onChange={(e) => setMovieID(e.target.value)}
            style={{ marginLeft: 10 }}
          >
            <option value="">-- Select a movie (optional) --</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title} ({movie.release_year})
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label htmlFor="venue">Select New Venue:</label>
          <select
            id="venue"
            value={venueID}
            onChange={(e) => setVenueID(e.target.value)}
            style={{ marginLeft: 10 }}
          >
            <option value="">-- Select a venue (optional) --</option>
            {venues.map((venue) => (
              <option key={venue.venue_id} value={venue.venue_id}>
                {venue.name} (Capacity: {venue.capacity})
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 10 }}>
          <input
            type="date"
            placeholder="Screening Date (optional)"
            value={screeningDate}
            onChange={(e) => setScreeningDate(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <input
            type="time"
            placeholder="Screening Time (optional)"
            value={screeningTime}
            onChange={(e) => setScreeningTime(e.target.value)}
            style={{ marginRight: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label htmlFor="status">Select New Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ marginLeft: 10 }}
          >
            <option value="">-- Select a status (optional) --</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button type="submit">Update Screening</button>
      </form>
    </div>
  );
}



export default function App() {
  return (
    <div className="appcontainer">
      <Router>
        <Routes>
          <Route path="/" element={<RoleSelect />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/attendee-home" element={<AttendeeHome />} />
          <Route path="/add-movie" element={<AddMovie />} />
          <Route path="/add-venue" element={<AddVenue />} />
          <Route path="/browse" element={<BrowseMovies />} />
          <Route path="/organizer-home" element={<OrganizerHome />} />
          <Route path="/schedule-screening" element={<ScheduleScreening />} />
          <Route path="/delete-screening" element={<DeleteScreening />} />
          <Route path="/update-screening" element={<UpdateScreening />} />
          <Route path="/screenings" element={<ScreeningsOptions />} />
          <Route path="/rsvp-screening" element={<RSVPScreening />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/explore-movies" element={<ExploreMovies />} />
          <Route path="/view-rsvp" element={<OrganizerRSVPReport />} />
          <Route path="/screening-report" element={<ScreeningReport />} />
          <Route path="/organizer-reports" element={<OrganizerReports />} />
          <Route path="/detailed-screening-report" element={<DetailedScreeningReport />} />
          <Route path="/popularity-genre-report" element={<PopularityGenreReport />} />
        </Routes>
      </Router>
    </div>
  );
}

















