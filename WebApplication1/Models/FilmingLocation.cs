using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver.GeoJsonObjectModel;

namespace WebApplication1.Models
{
    public class FilmingLocation
    {
        public string LocationName { get; set; }
        [BsonElement("Coordinates")]
        public GeoPoint Coordinates { get; set; } 
    }
}
