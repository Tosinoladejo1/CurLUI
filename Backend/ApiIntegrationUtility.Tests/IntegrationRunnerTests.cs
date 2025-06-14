#pragma warning disable CS0436
using System.Net;
using System.Net.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using ApiIntegrationUtility.Models;
using ApiIntegrationUtility.Services;

public class IntegrationRunnerTests
{
    [Fact]
    public async Task RunIntegrationAsync_SingleGetRequest_ReturnsSuccessfulResponse()
    {
        
        var responseContent = "{\"message\": \"success\"}";
        var handler = new MockHttpMessageHandler(responseContent, HttpStatusCode.OK);
        var httpClient = new HttpClient(handler);
        var runner = new IntegrationRunner(httpClient);

        var integration = new Integration
        {
            Requests = new List<RequestItem>
            {
                new RequestItem
                {
                    Method = "GET",
                    Url = "https://api.example.com/data",
                    Headers = new Dictionary<string, string>(),
                    Body = null,
                    PlaceholderSource = null
                }
            }
        };

        var runtimeValues = new Dictionary<string, string>();

        
        var result = await runner.RunIntegrationAsync(integration, runtimeValues);

        
        Assert.Single(result);
        Assert.Equal("https://api.example.com/data", result[0].Url);
        Assert.Equal(200, result[0].StatusCode);
        Assert.Contains("success", result[0].Response.ToString());
    }

    [Fact]
    public async Task RunIntegrationAsync_RetriesOnFailure()
    {
        int callCount = 0;
        var handler = new MockHttpMessageHandler((request, ct) =>
        {
            callCount++;
            if (callCount < 3)
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.InternalServerError));
            }
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("{\"message\": \"retry succeeded\"}")
            });
        });

        var httpClient = new HttpClient(handler);
        var runner = new IntegrationRunner(httpClient);

        var integration = new Integration
        {
            Requests = new List<RequestItem>
            {
                new RequestItem { Method = "GET", Url = "https://test.com" }
            }
        };

        
        var result = await runner.RunIntegrationAsync(integration, new Dictionary<string, string>());

        
        Assert.Equal(3, callCount); 
        Assert.Equal("https://test.com", result[0].Url);
        Assert.Equal(200, result[0].StatusCode);
        Assert.Contains("retry succeeded", result[0].Response.ToString());
    }

    [Fact]
    public async Task RunIntegrationAsync_ExtractsValueFromResponse()
    {
        
        var handler = new MockHttpMessageHandler((req, ct) =>
        {
            var json = "{\"userId\": \"abc123\", \"status\": \"ok\"}";
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json)
            });
        });

        var httpClient = new HttpClient(handler);
        var runner = new IntegrationRunner(httpClient);

        var integration = new Integration
        {
            Requests = new List<RequestItem>
            {
                new RequestItem
                {
                    Method = "GET",
                    Url = "https://api.example.com/start",
                    PlaceholderSource = "userId"
                },
                new RequestItem
                {
                    Method = "GET",
                    Url = "https://api.example.com/users/{{userId}}"
                }
            }
        };

        var runtimeValues = new Dictionary<string, string>();

        
        var result = await runner.RunIntegrationAsync(integration, runtimeValues);

        
        Assert.Equal(2, result.Count);
        Assert.Equal("https://api.example.com/start", result[0].Url);
        Assert.Equal("https://api.example.com/users/{{userId}}", result[1].Url);
        Assert.Equal(200, result[1].StatusCode);
    }
}
