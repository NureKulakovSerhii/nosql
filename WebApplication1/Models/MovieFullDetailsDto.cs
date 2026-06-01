using Microsoft.AspNetCore.Mvc.ViewEngines;

namespace WebApplication1.Models
{
    public class MovieFullDetailsDto: Movie
    {
        public List<Review> Reviews { get; set; } = new();
    }
}