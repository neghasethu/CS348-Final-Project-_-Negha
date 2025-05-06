import React, { useEffect, useState } from 'react';

export default function BrowseMovies() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch('/movies')
      .then(res => res.json())
      .then(setMovies);
  }, []);

  return (
    <div style={{ padding:20 }}>
      <h2>Select a Movie</h2>
      <select>
        <option value="">-- Choose --</option>
        {movies.map(m => (
          <option key={m.id} value={m.id}>
            {m.title} ({m.release_year}) — {m.director}
          </option>
        ))}
      </select>
    </div>
  );
}
