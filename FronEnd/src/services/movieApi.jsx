const BASE_URL = 'https://localhost:7097/api/Movies';

export const movieApi = {
  getAllMovies: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Помилка при отриманні всіх фільмів');
    return await response.json();
  },
  getMoviesNear: async (lat, lng, dist) => {
    const response = await fetch(`${BASE_URL}/near?latitude=${lat}&longitude=${lng}&distanceMeters=${dist}`);
    if (!response.ok) throw new Error('Помилка гео-пошуку');
    return await response.json();
  },
    deleteMovie(id) {
    return fetch(`${BASE_URL}/delete-film/${id}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (!res.ok) throw new Error('Помилка при видаленні фільму');
        return res.text().then(text => text ? JSON.parse(text) : {});
    });
    },
  updateMovie(id, updatedData) {
    return fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
    .then(res => {
        if (!res.ok) throw new Error('Помилка при оновленні фільму');
        return res.text().then(text => text ? JSON.parse(text) : {});
    });
  },
  getMovieFullDetails: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/full-details`);
    if (!response.ok) throw new Error('Помилка при отриманні детальної інформації про фільм');
    return await response.json();
  },
  createMovie: async (movieData) => {
    const formData = new FormData();
    formData.append('Title', movieData.title);
    formData.append('Genre', movieData.genre);
    formData.append('Year', parseInt(movieData.year) || 0); 
    formData.append('Director', movieData.director || 'Unknown');
    const parsedRating = parseFloat(movieData.rating);
    formData.append('Rating', isNaN(parsedRating) ? 0 : parsedRating);
    if (movieData.imageFile) {
        formData.append('ImageFile', movieData.imageFile);
    }
    if (movieData.filmingLocations && movieData.filmingLocations.length > 0) {
        movieData.filmingLocations.forEach((loc, index) => {
        formData.append(`FilmingLocations[${index}].LocationName`, loc.locationName);
        formData.append(`FilmingLocations[${index}].Latitude`, parseFloat(loc.latitude) || 0);
        formData.append(`FilmingLocations[${index}].Longitude`, parseFloat(loc.longitude) || 0);
        });
    }
    const response = await fetch(`${BASE_URL}/crate-film`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        throw new Error('Помилка при створенні фільму');
    }
    return await response.json();
    }
};