using System.ComponentModel.DataAnnotations;

namespace ApiIntegrationUtility.Models;

public class Integration
{
    [Key]
    public Guid IntegrationId { get; set; } = Guid.NewGuid();

    [Required]
    public string Name { get; set; } = string.Empty;

    
    public List<RequestItem> Requests { get; set; } = new();
}
