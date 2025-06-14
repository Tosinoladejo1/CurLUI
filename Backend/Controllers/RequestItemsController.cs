using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiIntegrationUtility.Models;
using ApiIntegrationUtility.Data;

namespace ApiIntegrationUtility.Controllers;

[ApiController]
[Route("integrations/{integrationId}/requests")]
public class RequestItemsController : ControllerBase
{
    private readonly AppDbContext _db;

    public RequestItemsController(AppDbContext db)
    {
        _db = db;
    }

    
    [HttpPost]
    public async Task<IActionResult> AddRequest(Guid integrationId, [FromBody] RequestItem request)
    {
        var integration = await _db.Integrations.Include(i => i.Requests)
                                                 .FirstOrDefaultAsync(i => i.IntegrationId == integrationId);
        if (integration == null)
            return NotFound("Integration not found.");

        request.Id = Guid.NewGuid();
        integration.Requests.Add(request);
        await _db.SaveChangesAsync();

        return Ok(request);
    }

    
    [HttpPut("{requestId}")]
    public async Task<IActionResult> UpdateRequest(Guid integrationId, Guid requestId, [FromBody] RequestItem updated)
    {
        var integration = await _db.Integrations.Include(i => i.Requests)
                                                 .FirstOrDefaultAsync(i => i.IntegrationId == integrationId);
        if (integration == null)
            return NotFound("Integration not found.");

        var existing = integration.Requests.FirstOrDefault(r => r.Id == requestId);
        if (existing == null)
            return NotFound("Request not found.");

        
        existing.Method = updated.Method;
        existing.Url = updated.Url;
        existing.Headers = updated.Headers;
        existing.Body = updated.Body;
        existing.UseBearerToken = updated.UseBearerToken;
        existing.PlaceholderSource = updated.PlaceholderSource;

        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    
    [HttpDelete("{requestId}")]
    public async Task<IActionResult> DeleteRequest(Guid integrationId, Guid requestId)
    {
        var integration = await _db.Integrations.Include(i => i.Requests)
                                                 .FirstOrDefaultAsync(i => i.IntegrationId == integrationId);
        if (integration == null)
            return NotFound("Integration not found.");

        var request = integration.Requests.FirstOrDefault(r => r.Id == requestId);
        if (request == null)
            return NotFound("Request not found.");

        _db.RequestItems.Remove(request);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
