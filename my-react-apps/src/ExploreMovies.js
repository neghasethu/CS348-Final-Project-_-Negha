import React, { useState, useEffect } from 'react';

export default function ExploreMovies() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await fetch('/explore-movies');
        if (res.ok) {
          const data = await res.json();
          setMovies(data);
        } else {
          console.error('Failed to fetch movies.');
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
      }
    }
    fetchMovies();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Explore Movies</h2>
      {movies.length === 0 ? (
        <p>No movies available.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Title</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Director</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Genre</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Runtime</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Release Year</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr key={movie.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movie.title}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movie.director}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movie.genre}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movie.runtime} min</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movie.release_year}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{movie.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
