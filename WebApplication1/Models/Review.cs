using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace WebApplication1.Models
{
    [BsonIgnoreExtraElements]
    public class Review
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string MovieId { get; set; }
        public string Text { get; set; }
        public int Score { get; set; }
    }
}
