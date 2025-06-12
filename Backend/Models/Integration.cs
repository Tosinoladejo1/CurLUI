namespace ApiIntegrationUtility.Models;
using System.ComponentModel.DataAnnotations;

/// <summary>
/// A named group of HTTP requests.
/// </summary>
public class Integration
{
    /// <summary>Unique identifier for the integration.</summary>

    public Guid Id { get; set; }
    /// <summary>Display name shown in the UI.</summary>
    [Required]
    [MinLength(3)]
    public string? Name { get; set; }
    [MinLength(1)]
    
    public List<RequestItem> Requests { get; set; } = new();
}
