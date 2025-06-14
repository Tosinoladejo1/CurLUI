namespace ApiIntegrationUtility.Models
{
    public class RunResultDto
    {
        public string Url { get; set; } = string.Empty;
        public int StatusCode { get; set; }
        public long DurationMs { get; set; }
        public object Response { get; set; } = new();
    }
}
