namespace ApiIntegrationUtility.Services;

using ApiIntegrationUtility.Models;

public class IntegrationService
{
    private readonly List<Integration> _integrations = new();

    public List<Integration> GetAll() => _integrations;

    public Integration? GetById(Guid id) =>
        _integrations.FirstOrDefault(i => i.Id == id);

    public void Add(Integration integration) =>
        _integrations.Add(integration);

    public void Update(Integration updated)
    {
        var index = _integrations.FindIndex(i => i.Id == updated.Id);
        if (index >= 0)
            _integrations[index] = updated;
    }

    public void Delete(Guid id) =>
        _integrations.RemoveAll(i => i.Id == id);
}
