import { useState, useEffect, useRef } from 'react';
import MovieCard from './components/MovieCard';
import CreateMovieForm from './components/CreateMovieForm';
import { movieApi } from './services/movieApi';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const createFormRef = useRef(null);

  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [distance, setDistance] = useState(5000);
  const [isSearching, setIsSearching] = useState(false);

  const loadAllMovies = () => {
    setLoading(true);
    movieApi.getAllMovies()
      .then(data => {
        setMovies(data);
        setLoading(false);
        setIsSearching(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isCreating && createFormRef.current) {
      createFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isCreating]);

  const handleMovieCreated = (newMovie) => {
    const formattedMovie = {
      ...newMovie,
      filmingLocations: newMovie.filmingLocations ? newMovie.filmingLocations.map(loc => {
        const lng = loc.coordinates?.coordinates ? loc.coordinates.coordinates[0] : 0;
        const lat = loc.coordinates?.coordinates ? loc.coordinates.coordinates[1] : 0;
        
        return {
          locationName: loc.locationName,
          latitude: lat,
          longitude: lng,
          coordinates: loc.coordinates
        };
      }) : []
    };

    setMovies(prevMovies => [...prevMovies, formattedMovie]);
    setIsCreating(false);
  };

  const handleUpdateMovie = (id, updatedData) => {
    return movieApi.updateMovie(id, updatedData)
      .then(() => {
        setMovies(prevMovies => prevMovies.map(m => {
          if (m.id === id) {
            return {
              ...m,
              title: updatedData.title,
              genre: updatedData.genre,
              year: updatedData.year,
              director: updatedData.director,
              filmingLocations: updatedData.filmingLocations.map(loc => ({
                locationName: loc.locationName,
                latitude: loc.latitude,
                longitude: loc.longitude,
                coordinates: {
                  type: "Point",
                  coordinates: [loc.longitude, loc.latitude]
                }
              }))
            };
          }
          return m;
        }));
      });
  };

  const handleDeleteMovie = (id) => {
    movieApi.deleteMovie(id)
      .then(() => {
        setMovies(prevMovies => prevMovies.filter(m => m.id !== id));
      })
      .catch(error => {
        console.error("Не вдалося видалити фільм:", error);
      });
  };

  useEffect(() => {
    loadAllMovies();
  }, []);

  const handleGeoSearch = (e) => {
    e.preventDefault();
    const searchLat = lat || '50.4501';
    const searchLng = lng || '30.5234';
    
    if (!lat) setLat(searchLat);
    if (!lng) setLng(searchLng);

    setLoading(true);
    
    movieApi.getMoviesNear(searchLat, searchLng, distance)
      .then(data => {
        setMovies(data);
        setLoading(false);
        setIsSearching(true);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Геолокація не підтримується вашим браузером");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(4));
        setLng(position.coords.longitude.toFixed(4));
      },
      () => {
        alert("Не вдалося отримати ваше розташування. Введіть координати вручну.");
      }
    );
  };

  return (
    <div className="app-main-container">
      <header className="app-header">
        <h2>Movie Geo-Tracker</h2>
        {!isCreating && (
          <button 
            type="button" 
            className="search-btn header-create-btn" 
            onClick={() => setIsCreating(true)}
          >
            + Створити фільм
          </button>
        )}
      </header>

      <div className="search-bar-container">
        <form onSubmit={handleGeoSearch} className="geo-search-form">
          <div className="input-group">
            <label>Latitude</label>
            <div className="input-with-icon">
              <input 
                type="number" 
                step="any" 
                placeholder="50.45" 
                value={lat} 
                onChange={(e) => setLat(e.target.value)}
              />
              <button 
                type="button" 
                className="location-detect-btn" 
                onClick={handleGetCurrentLocation}
                title="Визначити моє розташування"
              >
                <i className="material-icons">my_location</i>
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Longitude</label>
            <input 
              type="number" 
              step="any" 
              placeholder="30.52" 
              value={lng} 
              onChange={(e) => setLng(e.target.value)}
            />
          </div>

          <div className="input-group radius-group">
            <label>Radius: {distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`}</label>
            <input 
              type="range" 
              min="100" 
              max="10000000" 
              step="500"
              value={distance} 
              onChange={(e) => setDistance(Number(e.target.value))}
            />
          </div>

          <div className="search-buttons">
            <button type="submit" className="search-btn">
              <i className="material-icons">search</i> Пошук
            </button>
            
            {isSearching && (
              <button type="button" className="reset-btn" onClick={loadAllMovies}>
                Скинути
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading-text">Завантаження фільмів...</div>
      ) : (
        <div className="movies-grid">
          {movies.map(movie => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onUpdate={handleUpdateMovie} 
              onDelete={handleDeleteMovie} 
            />
          ))}

          {isCreating && (
            <div ref={createFormRef}>
              <CreateMovieForm 
                onMovieCreated={handleMovieCreated} 
                onCancel={() => setIsCreating(false)} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;