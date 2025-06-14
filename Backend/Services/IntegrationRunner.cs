using ApiIntegrationUtility.Models;
using Polly;
using Polly.Retry;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
namespace ApiIntegrationUtility.Services;


public class IntegrationRunner
{
    private readonly HttpClient _httpClient;
    private readonly AsyncRetryPolicy<HttpResponseMessage> _retryPolicy;

    public IntegrationRunner(HttpClient? httpClient = null)
    {
        _httpClient = httpClient ?? new HttpClient();

        _retryPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .Or<HttpRequestException>()
            .WaitAndRetryAsync(3, attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)),
                (outcome, timespan, retryAttempt, context) =>
                {
                    Console.WriteLine($"Retry {retryAttempt} after {timespan.TotalSeconds}s due to: {outcome.Exception?.Message ?? outcome.Result.StatusCode.ToString()}");
                });
    }

    public async Task<List<RunResultDto>> RunIntegrationAsync(Integration integration, Dictionary<string, string> runtimeValues)
    {
        var responses = new List<RunResultDto>();
        var placeholderData = new Dictionary<string, string>(runtimeValues);
        string? lastResponseBody = null;

        foreach (var request in integration.Requests)
        {
            if (!string.IsNullOrEmpty(lastResponseBody) && !string.IsNullOrEmpty(request.PlaceholderSource))
            {
                try
                {
                    var json = JObject.Parse(lastResponseBody);
                    var token = json.SelectToken(request.PlaceholderSource);
                    if (token != null)
                    {
                        var key = request.PlaceholderSource.Split('.').Last().Replace("$", "");
                        placeholderData[key] = token.ToString();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Placeholder Extract] Error: {ex.Message}");
                }
            }

            var resolvedUrl = ReplacePlaceholders(request.Url, placeholderData);
            var resolvedBody = ReplacePlaceholders(request.Body, placeholderData);

            var message = new HttpRequestMessage(new HttpMethod(request.Method), resolvedUrl);

            if (!string.IsNullOrEmpty(resolvedBody))
            {
                message.Content = new StringContent(resolvedBody, Encoding.UTF8, "application/json");
            }

            if (request.Headers != null)
            {
                foreach (var kv in request.Headers)
                {
                    message.Headers.TryAddWithoutValidation(
                        ReplacePlaceholders(kv.Key, placeholderData),
                        ReplacePlaceholders(kv.Value, placeholderData));
                }
            }

            if (request.UseBearerToken && placeholderData.TryGetValue("bearerToken", out var tokenValue))
            {
                message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenValue);
            }

            var stopwatch = Stopwatch.StartNew();
            HttpResponseMessage response;

            try
            {
                response = await _retryPolicy.ExecuteAsync(() => _httpClient.SendAsync(CloneRequest(message)));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Request failed after retries: {ex.Message}");
                responses.Add(new RunResultDto
                {
                    Url = resolvedUrl,
                    StatusCode = 0,
                    DurationMs = stopwatch.ElapsedMilliseconds,
                    Response = new { Error = ex.Message }
                });
                continue;
            }

            stopwatch.Stop();

            var content = await response.Content.ReadAsStringAsync();
            lastResponseBody = content;
            responses.Add(new RunResultDto
            {
                Url = resolvedUrl,
                StatusCode = (int)response.StatusCode,
                DurationMs = stopwatch.ElapsedMilliseconds,
                Response = TryPrettyJson(content)
            });
            Console.WriteLine($"Request to {resolvedUrl} completed with status {response.StatusCode} in {stopwatch.ElapsedMilliseconds}ms");
        }
        return responses;
    }

    private static string ReplacePlaceholders(string? text, Dictionary<string, string> data)
    {
        if (string.IsNullOrEmpty(text)) return "";
        return Regex.Replace(text, "{{(.*?)}}", match =>
        {
            var key = match.Groups[1].Value;
            return data.TryGetValue(key, out var value) ? value : match.Value;
        });
    }

    private static object TryPrettyJson(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return new {error = "Empty response" };
        try
        {
            var parsed = JsonConvert.DeserializeObject(input);
            return parsed ?? new { error = "Null JSON response" };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[JSON Parse Error] {ex.Message}");
            return new { Error = "Invalid JSON", Input = input };
        }
    }

    private static HttpRequestMessage CloneRequest(HttpRequestMessage oldRequest)
    {
        var newRequest = new HttpRequestMessage(oldRequest.Method, oldRequest.RequestUri);

        foreach (var header in oldRequest.Headers)
            newRequest.Headers.TryAddWithoutValidation(header.Key, header.Value);

        if (oldRequest.Content != null)
        {
            var oldContent = oldRequest.Content.ReadAsStringAsync().Result;
            newRequest.Content = new StringContent(oldContent, Encoding.UTF8, "application/json");
        }

        return newRequest;
    }

    internal async Task RunIntegrationAsync(Integration integration)
    {
        throw new NotImplementedException();
    }
}