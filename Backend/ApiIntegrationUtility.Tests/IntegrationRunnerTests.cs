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
        // Arrange
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

        // Act
        var result = await runner.RunIntegrationAsync(integration, runtimeValues);

        // Assert
        Assert.Single(result);
        var resultString = result[0].ToString();
        Assert.Contains("https://api.example.com/data", resultString);
        Assert.Contains("success", resultString);
    }
    [Fact]
    public async Task RunIntegrationAsync_RetriesOnFailure()
    {
        // Arrange: simulate two failures, one success
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

        // Act
        var result = await runner.RunIntegrationAsync(integration, new Dictionary<string, string>());

        // Assert
        Assert.Equal(3, callCount); // retried twice before success
        Assert.Contains("retry succeeded", result[0].ToString());
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

    // Act
    var result = await runner.RunIntegrationAsync(integration, runtimeValues);

    // Assert
    Assert.Equal(2, result.Count);
    var resultString = result[1].ToString();
    Assert.Contains("abc123", resultString);
}
}


