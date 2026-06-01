namespace WebApplication1.Models
{
    public class CreateMovieDto
    {
        public string Title { get; set; }
        public string Genre { get; set; }
        public int Year { get; set; }
        public string Director { get; set; }
        public double Rating { get; set; }
        public IFormFile? ImageFile { get; set; }
        public List<FilmingLocationDto> FilmingLocations { get; set; } = new();
    }
}
