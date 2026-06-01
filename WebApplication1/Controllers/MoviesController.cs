using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Models;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly MovieService _movieService;
        public MoviesController(MovieService movieService)
        {
            _movieService = movieService;
        }
        [HttpGet]
        public async Task<List<Movie>> GetMovies()
        {
            return await _movieService.GetMovies();
        }
        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Movie>> GetMovieById(string id)
        {
            var movie = await _movieService.GetMovieById(id);
            if (movie == null)
                return NotFound(new { message = "Movie with this id was not found" });
            return Ok(movie);
        }
        [HttpPost("crate-film")]
        public async Task<IActionResult> CreateMovie(CreateMovieDto movieDto)
        {
            string? savedImageUrl = null;
            if(movieDto.ImageFile != null && movieDto.ImageFile.Length > 0)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                if(!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(movieDto.ImageFile.FileName)}";
                var filePath = Path.Combine(folderPath, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await movieDto.ImageFile.CopyToAsync(stream);
                }
                savedImageUrl = $"{Request.Scheme}://{Request.Host}/images/{fileName}";
            }
            var movie = new Movie
            {
                Title = movieDto.Title,
                Genre = movieDto.Genre,
                Year = movieDto.Year,
                Director = movieDto.Director,
                Rating = movieDto.Rating,
                ImageUrl = savedImageUrl,
                FilmingLocations = movieDto.FilmingLocations?.Select(loc => new FilmingLocation
                {
                    LocationName = loc.LocationName,
                    Coordinates = new GeoPoint
                    {
                        Type = "Point",
                        Coordinates = new double[] { loc.Longitude, loc.Latitude }
                    }
                }).ToList()
            };
            await _movieService.CreateFilm(movie);
            return CreatedAtAction(nameof(GetMovieById), new { id = movie.Id }, movie);
        }
        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> UpdateMovie(string id, UpdateMovieDto updateMovieDto)
        {
            var movie = await _movieService.GetMovieById(id);
            if (movie == null)
                return NotFound(new { message = "Movie with this id w   as not found" });
            movie.Title = updateMovieDto.Title ?? movie.Title;
            movie.Genre = updateMovieDto.Genre ?? movie.Genre;
            movie.Year = updateMovieDto.Year ?? movie.Year;
            movie.Director = updateMovieDto.Director ?? movie.Director;
            movie.Rating = updateMovieDto.Rating ?? movie.Rating;

            if (updateMovieDto.FilmingLocations != null && updateMovieDto.FilmingLocations.Any())
            {
                movie.FilmingLocations = updateMovieDto.FilmingLocations.Select(loc => new FilmingLocation
                {
                    LocationName = loc.LocationName,
                    Coordinates = new GeoPoint
                    {
                        Type = "Point",
                        Coordinates = new double[] { loc.Longitude, loc.Latitude }
                    }
                }).ToList();
            }
            await _movieService.UpdateAsync(id, movie);
            return Ok(new { message = "Movie was updated" });
        }
        [HttpDelete("delete-film/{id:length(24)}")]
        public async Task<IActionResult> DeleteMovie(string id)
        {
            var movie = await _movieService.GetMovieById(id);
            if (movie == null)
                return NotFound(new { message = "Movie with id was not found" });
            await _movieService.RemoveAsync(id);
            return Ok(new { message = "Movie was deleted" });
        }
        [HttpGet("search")]
        public async Task<IActionResult> SearchFilms([FromQuery] string? genre, [FromQuery] int? yearFrom)
        {
            var results = await _movieService.SearchMovieAsync(genre, yearFrom);
            return Ok(results);
        }
        [HttpGet("{id}/full-details")]
        public async Task<IActionResult> GetFullInfo(string id)
        {
            var details = await _movieService.GetFullInfo(id);
            if (details == null)
                return NotFound(new { message = "Movie with this id was not found" });
            return Ok(details);
        }
        [HttpGet("near")]
        public async Task<IActionResult> GetMoviesNearLocation([FromQuery] double latitude, [FromQuery] double longitude, [FromQuery] double distanceMeters = 5000)
        {
            var movies = await _movieService.GetMoviesNearLocation(latitude, longitude, distanceMeters);
            return Ok(movies);
        }
    }
}