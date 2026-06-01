import { useState } from 'react';
import { movieApi } from '../services/movieApi';

const CreateMovieForm = ({ onMovieCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [director, setDirector] = useState('');
  const [rating, setRating] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [locations, setLocations] = useState([]);
  const [newLocName, setNewLocName] = useState('');
  const [newLocLat, setNewLocLat] = useState('');
  const [newLocLng, setNewLocLng] = useState('');

  const handleAddLocation = () => {
    if (!newLocName || !newLocLat || !newLocLng) {
      alert("Заповніть назву локації, Latitude та Longitude!");
      return;
    }
    setLocations([...locations, {
      locationName: newLocName,
      latitude: parseFloat(newLocLat),
      longitude: parseFloat(newLocLng)
    }]);
    setNewLocName('');
    setNewLocLat('');
    setNewLocLng('');
  };

  const handleRemoveLocation = (indexToRemove) => {
    setLocations(locations.filter((_, index) => index !== indexToRemove));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !genre || !year) {
      alert("Назва, Жанр та Рік є обов'язковими полями!");
      return;
    }

    const payload = {
      title,
      genre,
      year: parseInt(year),
      director: director || 'Unknown',
      rating: parseFloat(rating) || 0,
      imageFile: imageFile, 
      filmingLocations: locations
    };

    try {
      const newMovie = await movieApi.createMovie(payload);
      onMovieCreated(newMovie);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Помилка при створенні фільму на бекенді.");
    }
  };

  const resetForm = () => {
    setTitle('');
    setGenre('');
    setYear('');
    setDirector('');
    setRating('');
    setImageFile(null);
    setLocations([]);
  };

  return (
    <div className="cellphone-container editing-mode form-create-container">
      <div className="movie-controls">
        <button className="control-btn save" title="Створити фільм" onClick={handleSubmit}>
          <i className="material-icons">check</i>
        </button>
        <button className="control-btn cancel" title="Скасувати" onClick={onCancel}>
          <i className="material-icons">close</i>
        </button>
      </div>
      <div className="text-movie-cont form-text-cont">
        <div className="edit-form-inside form-flex-wrapper">
          
          <h3 className="form-main-title">
            НОВИЙ ФІЛЬМ
          </h3>
          <input 
            type="text" 
            className="edit-input-h1 form-title-input" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Назва фільму *"
          />
          <div className="edit-row-gen form-row-margin">
            <input 
              type="number" 
              className="edit-input-gen" 
              value={year} 
              onChange={e => setYear(e.target.value)} 
              placeholder="Рік *"
            />
            <span className="gen-separator">/</span>
            <input 
              type="text" 
              className="edit-input-gen genre-width" 
              value={genre} 
              onChange={e => setGenre(e.target.value)} 
              placeholder="Жанр *"
            />
          </div>
          <div className="edit-director-container form-director-row">
            <input 
              type="text" 
              className="edit-input-director form-director-w" 
              value={director} 
              onChange={e => setDirector(e.target.value)} 
              placeholder="Director (Unknown)"
            />
            <input 
              type="number" 
              step="0.1"
              max="10"
              min="0"
              className="edit-input-director form-rating-w" 
              value={rating} 
              onChange={e => setRating(e.target.value)} 
              placeholder="Rating (0.0)"
            />
          </div>
          <div className="edit-locations-section form-poster-box">
            <h5 className="form-section-title">ПОСТЕР ФІЛЬМУ (ОПЦІОНАЛЬНО)</h5>
            <div className="form-poster-row">
              <label className="add-loc-inline-btn form-file-label">
                <i className="material-icons form-upload-icon">cloud_upload</i>
                {imageFile ? "Змінити" : "Обрати photo"}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="form-hidden-file"
                />
              </label>
              <span className="form-file-name">
                {imageFile ? imageFile.name : "Файл не обрано"}
              </span>
            </div>
          </div>
          <div className="edit-locations-section form-locations-box">
            <h5 className="form-section-title">FILMING LOCATIONS ({locations.length})</h5>
            <div className="edit-locations-list form-locations-scroll">
              {locations.map((loc, i) => (
                <div key={i} className="edit-location-item form-loc-item">
                  <span className="edit-loc-text form-loc-text-sz">{loc.locationName} ({loc.latitude}, {loc.longitude})</span>
                  <i className="material-icons delete-loc-icon form-loc-del-sz" onClick={() => handleRemoveLocation(i)}>cancel</i>
                </div>
              ))}
            </div>
            <div className="add-loc-subform form-subform-box">
              <input 
                type="text" 
                className="edit-subinput-text form-subinput-pad"
                placeholder="Назва нової локації" 
                value={newLocName} 
                onChange={e => setNewLocName(e.target.value)}
              />
              <div className="subform-row-coords form-coords-row">
                <input type="number" step="any" placeholder="Lat" value={newLocLat} onChange={e => setNewLocLat(e.target.value)} className="form-subinput-pad form-coord-input" />
                <input type="number" step="any" placeholder="Lng" value={newLocLng} onChange={e => setNewLocLng(e.target.value)} className="form-subinput-pad form-coord-input" />
              </div>
              <button 
                type="button" 
                className="add-loc-inline-btn form-submit-loc-btn" 
                onClick={handleAddLocation}
              >
                + Додати локацію
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMovieForm;