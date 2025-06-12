namespace ApiIntegrationUtility.Services;

using ApiIntegrationUtility.Models;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Polly;
using Polly.Retry;
using System.Net.Http;

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

    public async Task<List<object>> RunIntegrationAsync(Integration integration, Dictionary<string, string> runtimeValues)
    {
        var responses = new List<object>();
        var placeholderData = new Dictionary<string, string>(runtimeValues);

        foreach (var request in integration.Requests)
        {
            string resolvedUrl = ReplacePlaceholders(request.Url, placeholderData);
            string? resolvedBody = ReplacePlaceholders(request.Body, placeholderData);

            var message = new HttpRequestMessage(
                new HttpMethod(request.Method), resolvedUrl);

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

            var stopwatch = Stopwatch.StartNew();
            HttpResponseMessage response;
            try
            {
                response = await _retryPolicy.ExecuteAsync(() => _httpClient.SendAsync(CloneRequest(message)));

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Request failed after retries: {ex.Message}");
                responses.Add(new { Url = resolvedUrl, Error = ex.Message });
                continue;
            }
            stopwatch.Stop();

            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"{request.Method} {resolvedUrl} ({stopwatch.ElapsedMilliseconds}ms): {response.StatusCode}");

            if (!string.IsNullOrEmpty(request.PlaceholderSource))
            {
                try
                {
                    using var doc = JsonDocument.Parse(content);
                    var value = doc.RootElement
                        .GetProperty(request.PlaceholderSource)
                        .ToString();

                    if (value != null)
                        placeholderData[request.PlaceholderSource] = value;
                }
                catch { /* skip silently */ }
            }

            responses.Add(new
            {
                Url = resolvedUrl,
                StatusCode = (int)response.StatusCode,
                DurationMs = stopwatch.ElapsedMilliseconds,
                Response = TryPrettyJson(content)
            });
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
        try
        {
            using var doc = JsonDocument.Parse(input);
            return JsonSerializer.Serialize(doc, new JsonSerializerOptions { WriteIndented = true });
        }
        catch
        {
            return input;
        }
    }
    private static HttpRequestMessage CloneRequest(HttpRequestMessage oldRequest)
{
    var newRequest = new HttpRequestMessage(oldRequest.Method, oldRequest.RequestUri);

    // Copy headers
    foreach (var header in oldRequest.Headers)
        newRequest.Headers.TryAddWithoutValidation(header.Key, header.Value);

    // Copy content
    if (oldRequest.Content != null)
    {
        var oldContent = oldRequest.Content.ReadAsStringAsync().Result;
        newRequest.Content = new StringContent(oldContent, System.Text.Encoding.UTF8, "application/json");
    }

    return newRequest;
}

}
