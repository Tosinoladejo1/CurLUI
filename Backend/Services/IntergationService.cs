using ApiIntegrationUtility.Models;
using ApiIntegrationUtility.Data;
using Microsoft.EntityFrameworkCore;

namespace ApiIntegrationUtility.Services;

public class IntegrationService
{
    private readonly AppDbContext _db;

    public IntegrationService(AppDbContext db)
    {
        _db = db;
    }

    public List<Integration> GetAll() =>
        _db.Integrations.Include(i => i.Requests).ToList();

    public Integration? GetById(Guid id) =>
        _db.Integrations.Include(i => i.Requests)
                        .FirstOrDefault(i => i.IntegrationId == id);

    public void Add(Integration integration)
    {
        _db.Integrations.Add(integration);
        _db.SaveChanges();
    }

    public void Update(Integration integration)
    {
        var existing = _db.Integrations
            .Include(i => i.Requests)
            .FirstOrDefault(i => i.IntegrationId == integration.IntegrationId);

        if (existing != null)
        {
            existing.Name = integration.Name;

            existing.Requests.Clear();
            foreach (var request in integration.Requests)
            {
                if (request.Id == Guid.Empty)
                    request.Id = Guid.NewGuid();
                existing.Requests.Add(request);
            }

            _db.SaveChanges();
        }
    }

    public void Delete(Guid id)
    {
        var integration = _db.Integrations
            .Include(i => i.Requests)
            .FirstOrDefault(i => i.IntegrationId == id);

        if (integration != null)
        {
            _db.RequestItems.RemoveRange(integration.Requests);
            _db.Integrations.Remove(integration);
            _db.SaveChanges();
        }
    }

    public void AddRequest(Guid integrationId, RequestItem request)
    {
        var integration = _db.Integrations
            .AsNoTracking() 
            .FirstOrDefault(i => i.IntegrationId == integrationId);

        if (integration == null)
            throw new KeyNotFoundException("Integration not found.");

        request.Id = Guid.NewGuid();
        request.IntegrationId = integrationId;

        _db.RequestItems.Add(request);  
        _db.SaveChanges();              
    }
    public void SaveChanges() => _db.SaveChanges();
    
    public void UpdateRequest(Guid integrationId, Guid requestId, RequestItem updated)
    {
        var request = _db.RequestItems
            .FirstOrDefault(r => r.IntegrationId == integrationId && r.Id == requestId);

        if (request == null)
            throw new KeyNotFoundException("Request not found.");

        
        request.Method = updated.Method;
        request.Url = updated.Url;
        request.Headers = updated.Headers;
        request.Body = updated.Body;
        request.UseBearerToken = updated.UseBearerToken;
        request.PlaceholderSource = updated.PlaceholderSource;

        _db.SaveChanges();
    }

    
    public void DeleteRequest(Guid integrationId, Guid requestId)
    {
        var request = _db.RequestItems
            .FirstOrDefault(r => r.IntegrationId == integrationId && r.Id == requestId);

        if (request == null)
            throw new KeyNotFoundException("Request not found.");

        _db.RequestItems.Remove(request);
        _db.SaveChanges();
    }
}
