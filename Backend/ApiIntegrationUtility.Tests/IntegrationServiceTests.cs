using Xunit;
using System;
using Microsoft.EntityFrameworkCore;
using ApiIntegrationUtility.Models;
using ApiIntegrationUtility.Services;
using ApiIntegrationUtility.Data;

public class IntegrationServiceTests
{
    private IntegrationService CreateService()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var context = new AppDbContext(options);
        return new IntegrationService(context);
    }

    [Fact]
    public void Add_ShouldStoreIntegration()
    {
        var service = CreateService();
        var integration = new Integration { IntegrationId = Guid.NewGuid(), Name = "Test" };

        service.Add(integration);

        var all = service.GetAll();
        Assert.Single(all);
        Assert.Equal("Test", all[0].Name);
    }

    [Fact]
    public void GetById_ShouldReturnCorrectIntegration()
    {
        var service = CreateService();
        var id = Guid.NewGuid();
        service.Add(new Integration { IntegrationId = id, Name = "Match" });

        var result = service.GetById(id);

        Assert.NotNull(result);
        Assert.Equal("Match", result!.Name);
    }

    [Fact]
    public void Update_ShouldReplaceExistingIntegration()
    {
        var service = CreateService();
        var id = Guid.NewGuid();
        service.Add(new Integration { IntegrationId = id, Name = "Old" });

        service.Update(new Integration { IntegrationId = id, Name = "New" });

        var updated = service.GetById(id);
        Assert.Equal("New", updated!.Name);
    }

    [Fact]
    public void Delete_ShouldRemoveIntegration()
    {
        var service = CreateService();
        var id = Guid.NewGuid();
        service.Add(new Integration { IntegrationId = id, Name = "DeleteMe" });

        service.Delete(id);

        var result = service.GetById(id);
        Assert.Null(result);
    }
}
