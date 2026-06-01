import { useState, useEffect } from 'react';
import { movieApi } from '../services/movieApi';
import './MovieCard.css';

const MovieCard = ({ movie, onUpdate, onDelete }) => {
  const defaultImg = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000";

  const [isEditing, setIsEditing] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);

  const [editTitle, setEditTitle] = useState(movie.title);
  const [editGenre, setEditGenre] = useState(movie.genre);
  const [editYear, setEditYear] = useState(movie.year);
  const [editDirector, setEditDirector] = useState(movie.director || '');
  const [editLocations, setEditLocations] = useState([]);

  useEffect(() => {
    setEditTitle(movie.title);
    setEditGenre(movie.genre);
    setEditYear(movie.year);
    setEditDirector(movie.director || '');
    setEditLocations(
      movie.filmingLocations ? movie.filmingLocations.map(loc => ({
        locationName: loc.locationName,
        latitude: loc.coordinates?.coordinates ? loc.coordinates.coordinates[1] : (loc.latitude || 0),
        longitude: loc.coordinates?.coordinates ? loc.coordinates.coordinates[0] : (loc.longitude || 0),
        coordinates: loc.coordinates 
      })) : []
    );
  }, [movie]);

  const [newLocName, setNewLocName] = useState('');
  const [newLocLat, setNewLocLat] = useState('');
  const [newLocLng, setNewLocLng] = useState('');

  const handleCardClick = async () => {
    if (isEditing) return;

    if (showReviews) {
      setShowReviews(false);
    } else {
      try {
        const fullData = await movieApi.getMovieFullDetails(movie.id);
        setReviews(fullData.reviews || []);
        setShowReviews(true);
      } catch (err) {
        console.error("Не вдалося завантажити відгуки:", err);
        alert("Помилка завантаження відгуків");
      }
    }
  };

  const handleLocationClick = (e, loc) => {
    e.stopPropagation();
    if (isEditing) return;
    const geometry = loc.coordinates || {
      type: "Point",
      coordinates: [loc.longitude, loc.latitude]
    };
    if (!geometry.coordinates || geometry.coordinates.length < 2) {
      alert("Координати для цієї локації відсутні.");
      return;
    }
    const geoJsonData = {
      type: "Feature",
      geometry: geometry,
      properties: { name: loc.locationName }
    };
    const jsonString = encodeURIComponent(JSON.stringify(geoJsonData));
    const mapUrl = `https://geojson.io/#data=data:application/json,${jsonString}`;
    window.open(mapUrl, '_blank');
  };

  const handleAddLocationToList = () => {
    if (!newLocName || !newLocLat || !newLocLng) {
      alert("Заповніть назву локації, Latitude та Longitude!");
      return;
    }
    setEditLocations([...editLocations, {
      locationName: newLocName,
      latitude: parseFloat(newLocLat),
      longitude: parseFloat(newLocLng),
      coordinates: {
        type: "Point",
        coordinates: [parseFloat(newLocLng), parseFloat(newLocLat)]
      }
    }]);
    setNewLocName('');
    setNewLocLat('');
    setNewLocLng('');
  };

  const handleRemoveLocationFromList = (indexToRemove) => {
    setEditLocations(editLocations.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    const payload = {
      title: editTitle,
      genre: editGenre,
      year: parseInt(editYear),
      director: editDirector,
      rating: movie.rating || 0, 
      filmingLocations: editLocations.map(loc => ({
        locationName: loc.locationName,
        latitude: parseFloat(loc.latitude),
        longitude: parseFloat(loc.longitude)
      }))
    };

    try {
      await onUpdate(movie.id, payload);
      setIsEditing(false);
    } catch (err) {
      console.error("Помилка збереження структури:", err);
    }
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setEditTitle(movie.title);
    setEditGenre(movie.genre);
    setEditYear(movie.year);
    setEditDirector(movie.director || '');
    setEditLocations(
      movie.filmingLocations ? movie.filmingLocations.map(loc => ({
        locationName: loc.locationName,
        latitude: loc.coordinates?.coordinates ? loc.coordinates.coordinates[1] : (loc.latitude || 0),
        longitude: loc.coordinates?.coordinates ? loc.coordinates.coordinates[0] : (loc.longitude || 0),
        coordinates: loc.coordinates
      })) : []
    );
    setIsEditing(false);
  };

  return (
    <div 
      className={`cellphone-container ${isEditing ? 'editing-mode' : ''} card-clickable-state`} 
      onClick={handleCardClick}
    >
      <div className="movie-controls">
        {isEditing ? (
          <>
            <button className="control-btn save" title="Зберегти" onClick={handleSave}>
              <i className="material-icons">check</i>
            </button>
            <button className="control-btn cancel" title="Скасувати" onClick={handleCancel}>
              <i className="material-icons">close</i>
            </button>
          </>
        ) : (
          <>
            <button 
              className="control-btn edit" 
              title="Редагувати" 
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowReviews(false); }}
            >
              <i className="material-icons">edit</i>
            </button>
            <button 
              className="control-btn delete" 
              title="Видалити" 
              onClick={(e) => { e.stopPropagation(); onDelete(movie.id); }}
            >
              <i className="material-icons">delete</i>
            </button>
          </>
        )}
      </div>

      <div 
        className="movie-img" 
        style={{ backgroundImage: `url(${movie.imageUrl || defaultImg})` }}
      >
        <div className="movie-gradient"></div>
      </div>

      <div className={`text-movie-cont ${(isEditing || showReviews) ? 'scrollable-edit-mode' : ''}`}>
        
        {isEditing && (
          <div className="edit-form-inside" onClick={(e) => e.stopPropagation()}>
            <input 
              type="text" 
              className="edit-input-h1" 
              value={editTitle} 
              onChange={e => setEditTitle(e.target.value)} 
              placeholder="Назва фільму"
            />
            
            <div className="edit-row-gen">
              <input 
                type="number" 
                className="edit-input-gen" 
                value={editYear} 
                onChange={e => setEditYear(e.target.value)} 
                placeholder="Рік"
              />
              <span className="gen-separator">/</span>
              <input 
                type="text" 
                className="edit-input-gen genre-width" 
                value={editGenre} 
                onChange={e => setEditGenre(e.target.value)} 
                placeholder="Жанр"
              />
            </div>

            <div className="edit-director-container">
              <span className="director-label">Director: </span>
              <input 
                type="text" 
                className="edit-input-director" 
                value={editDirector} 
                onChange={e => setEditDirector(e.target.value)} 
                placeholder="Unknown"
              />
            </div>

            <div className="edit-locations-section">
              <h5>FILMING LOCATIONS ({editLocations.length})</h5>
              
              <div className="edit-locations-list">
                {editLocations.map((loc, i) => (
                  <div key={i} className="edit-location-item">
                    <span className="edit-loc-text">{loc.locationName} ({loc.latitude}, {loc.longitude})</span>
                    <i className="material-icons delete-loc-icon" onClick={() => handleRemoveLocationFromList(i)}>cancel</i>
                  </div>
                ))}
              </div>

              <div className="add-loc-subform">
                <input 
                  type="text" 
                  className="edit-subinput-text"
                  placeholder="Назва нової локації" 
                  value={newLocName} 
                  onChange={e => setNewLocName(e.target.value)}
                />
                <div className="subform-row-coords">
                  <input type="number" step="any" placeholder="Lat" value={newLocLat} onChange={e => setNewLocLat(e.target.value)} />
                  <input type="number" step="any" placeholder="Lng" value={newLocLng} onChange={e => setNewLocLng(e.target.value)} />
                </div>
                <button type="button" className="add-loc-inline-btn" onClick={handleAddLocationToList}>
                  + Додати локацію
                </button>
              </div>
            </div>
          </div>
        )}

        {!isEditing && showReviews && (
          <div className="edit-form-inside">
            <div className="mr-grid">
              <div>
                <h1>{editTitle}</h1>
                <ul className="movie-gen">
                  <li>Назад до інфо (клік)</li>
                </ul>
              </div>
            </div>

            <div className="edit-locations-section section-zero-margin">
              <h5>REVIEWS ({reviews.length})</h5>
              <div className="locations-container reviews-scroll-container">
                {reviews.map((rev, index) => (
                  <div 
                    key={index} 
                    className="location-badge review-item-badge"
                    onClick={(e) => e.stopPropagation()} 
                  >
                    <span className="review-text-span">"{rev.text}"</span>
                    <span className="movie-rating-badge review-rating-sz">
                      <i className="material-icons review-star-sz">star</i>
                      {rev.score}/10
                    </span>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <span className="no-reviews-placeholder">No reviews yet...</span>
                )}
              </div>
            </div>
          </div>
        )}

        {!isEditing && !showReviews && (
          <>
            <div className="mr-grid">
              <div>
                <h1>{editTitle}</h1>
                <ul className="movie-gen">
                  <li>{editYear} / </li>
                  <li>{editGenre}</li>
                </ul>
              </div>
              <div className="movie-rating-badge">
                <i className="material-icons">star</i>
                <span>{movie.rating?.toFixed(1) || 0.0}</span>
              </div>
            </div>

            <div className="mr-grid">
              <p className="movie-director">Director: {editDirector || 'Unknown'}</p>
            </div>

            <div>
              <h5>FILMING LOCATIONS (TOP 3)</h5>
              <div className="locations-container">
                {editLocations && editLocations.slice(0, 3).map((loc, index) => (
                  <div 
                    key={index} 
                    className="location-badge"
                    onClick={(e) => handleLocationClick(e, loc)}
                    title="Переглянути GeoJSON"
                  >
                    <i className="material-icons">location_on</i>
                    <span>{loc.locationName}</span>
                  </div>
                ))}
                {(!editLocations || editLocations.length === 0) && (
                  <span className="no-locations-placeholder">No locations added</span>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default MovieCard;