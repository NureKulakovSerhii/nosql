using Microsoft.AspNetCore.Mvc.ViewEngines;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;
using WebApplication1.Models;

namespace WebApplication1.Services
{
    public class MovieService
    {
        private readonly IMongoCollection<Movie> _moviesCollection;
        public MovieService(IMongoDatabase mongoDatabase)
        {
            _moviesCollection = mongoDatabase.GetCollection<Movie>("movies");
        }
        public async Task<List<Movie>> GetMovies()
        {
            return await _moviesCollection.Find(_ => true).ToListAsync();
        }
        public async Task<Movie?> GetMovieById(string id)
        {
            return await _moviesCollection.Find(m => m.Id == id).FirstOrDefaultAsync();
        }
        public async Task CreateFilm(Movie movie)
        {
            await _moviesCollection.InsertOneAsync(movie);
        }
        public async Task UpdateAsync(string id, Movie updatedMovie)
        {
            await _moviesCollection.ReplaceOneAsync(m => m.Id == id, updatedMovie);
        }
        public async Task RemoveAsync(string id)
        {
            await _moviesCollection.DeleteOneAsync(m => m.Id == id);
        }
        public async Task<List<Movie>> SearchMovieAsync(string? genre, int? yearFrom)
        {
            var filterBuilder = Builders<Movie>.Filter;
            var filter = filterBuilder.Empty;
            if (!string.IsNullOrEmpty(genre))
                filter &= filterBuilder.Eq(m => m.Genre, genre);
            if (yearFrom.HasValue)
                filter &= filterBuilder.Gte(m => m.Year, yearFrom.Value);
            return await _moviesCollection.Find(filter).ToListAsync();
        }
        public async Task<MovieFullDetailsDto?> GetFullInfo(string movieId)
        {
            return await _moviesCollection.Aggregate()
                .Match(m => m.Id == movieId)
                .Lookup<Movie, Review, MovieFullDetailsDto>(
                    _moviesCollection.Database.GetCollection<Review>("reviews"),
                    m => m.Id,  
                    r => r.MovieId,  
                    m => m.Reviews   
                )
                .FirstOrDefaultAsync();
        }
        public async Task<List<Movie>>GetMoviesNearLocation(double latitude, double longtitude, double maxDistanceInMeters)
        {
            var point = GeoJson.Point(GeoJson.Geographic(longtitude, latitude));
            var filter = Builders<Movie>.Filter.NearSphere(
                "FilmingLocations.Coordinates", point, maxDistanceInMeters);
            return await _moviesCollection.Find(filter).ToListAsync();
        }
    }
}
