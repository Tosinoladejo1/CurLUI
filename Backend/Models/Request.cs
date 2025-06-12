namespace ApiIntegrationUtility.Models;
using System.ComponentModel.DataAnnotations;

public class RequestItem
{
    [Required]
    [RegularExpression("GET|POST|PUT|DELETE")]
    public string Method { get; set; } = string.Empty; // GET, POST, etc.

    [Required]
    [Url]
    public string? Url { get; set; }
    public Dictionary<string, string>? Headers { get; set; }
    public string? Body { get; set; }
    public string? PlaceholderSource { get; set; } // e.g. {{userId}} from response
}
