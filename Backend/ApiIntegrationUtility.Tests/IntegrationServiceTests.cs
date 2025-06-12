using Xunit;
using System;
using System.Collections.Generic;
using ApiIntegrationUtility.Models;
using ApiIntegrationUtility.Services;

public class IntegrationServiceTests
{
    [Fact]
    public void Add_ShouldStoreIntegration()
    {
        var service = new IntegrationService();
        var integration = new Integration { Id = Guid.NewGuid(), Name = "Test" };

        service.Add(integration);

        var all = service.GetAll();
        Assert.Single(all);
        Assert.Equal("Test", all[0].Name);
    }

    [Fact]
    public void GetById_ShouldReturnCorrectIntegration()
    {
        var service = new IntegrationService();
        var id = Guid.NewGuid();
        service.Add(new Integration { Id = id, Name = "Match" });

        var result = service.GetById(id);

        Assert.NotNull(result);
        Assert.Equal("Match", result!.Name);
    }

    [Fact]
    public void Update_ShouldReplaceExistingIntegration()
    {
        var service = new IntegrationService();
        var id = Guid.NewGuid();
        service.Add(new Integration { Id = id, Name = "Old" });

        service.Update(new Integration { Id = id, Name = "New" });

        var updated = service.GetById(id);
        Assert.Equal("New", updated!.Name);
    }

    [Fact]
    public void Delete_ShouldRemoveIntegration()
    {
        var service = new IntegrationService();
        var id = Guid.NewGuid();
        service.Add(new Integration { Id = id, Name = "DeleteMe" });

        service.Delete(id);

        var result = service.GetById(id);
        Assert.Null(result);
    }
}
