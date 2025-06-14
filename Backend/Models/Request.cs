using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace ApiIntegrationUtility.Models;

public class RequestItem
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [RegularExpression("GET|POST|PUT|DELETE")]
    public string Method { get; set; } = string.Empty;

    [Required]
    [Url]
    public string? Url { get; set; }
    public bool UseBearerToken { get; set; } = false;

    [NotMapped]
    public Dictionary<string, string>? Headers
    {
        get => string.IsNullOrEmpty(HeadersJson)
            ? new Dictionary<string, string>()
            : JsonSerializer.Deserialize<Dictionary<string, string>>(HeadersJson);
        set => HeadersJson = JsonSerializer.Serialize(value ?? new());
    }

    public string? HeadersJson { get; set; }

    public string? Body { get; set; }
    public string? PlaceholderSource { get; set; }

    [Required]
    public Guid IntegrationId { get; set; }

    [ForeignKey("IntegrationId")]
    [System.Text.Json.Serialization.JsonIgnore]
    public Integration? Integration { get; set; }
}
