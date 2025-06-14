using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ApiIntegrationUtility.Services;
using ApiIntegrationUtility.Models;

namespace ApiIntegrationUtility.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IntegrationsController : ControllerBase
{
    private readonly IntegrationService _service;
    private readonly IntegrationRunner _runner;

    public IntegrationsController(IntegrationService service, IntegrationRunner runner)
    {
        _service = service;
        _runner = runner;
    }

   
    [HttpGet]
    [ProducesResponseType(200)]
    public IActionResult GetAll() => Ok(_service.GetAll());

    
    [HttpGet("{id}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public IActionResult Get(Guid id)
    {
        var integration = _service.GetById(id);
        if (integration == null) return NotFound();
        return Ok(integration);
    }

    
    [HttpPost]
    [ProducesResponseType(201)]
    public IActionResult Create([FromBody] Integration integration)
    {
        integration.IntegrationId = Guid.NewGuid();
        _service.Add(integration);
        return CreatedAtAction(nameof(Get), new { id = integration.IntegrationId }, integration);
    }

   
    [HttpPut("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    public IActionResult Update(Guid id, [FromBody] Integration integration)
    {
        if (id != integration.IntegrationId)
            return BadRequest();
        _service.Update(integration);
        return NoContent();
    }

    
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    public IActionResult Delete(Guid id)
    {
        _service.Delete(id);
        return NoContent();
    }

    
    [HttpPost("run/{id}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<List<RunResultDto>>> Run(Guid id, [FromBody] Dictionary<string, string> runtimeValues)
    {
        var integration = _service.GetById(id);
        if (integration == null) return NotFound();
        var result = await _runner.RunIntegrationAsync(integration, runtimeValues);
        return Ok(result);
    }

    
    [HttpPost("{id}/requests")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public IActionResult AddRequest(Guid id, [FromBody] RequestItem request)
    {
        try
        {
            _service.AddRequest(id, request);
            return Ok(request);
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(e.Message);
        }
    }

    
    [HttpDelete("{id}/requests/{requestId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public IActionResult DeleteRequest(Guid id, Guid requestId)
    {
        try
        {
            _service.DeleteRequest(id, requestId);
            return NoContent();
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(e.Message);
        }
    }

    
    [HttpPut("{id}/requests/{requestId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public IActionResult UpdateRequest(Guid id, Guid requestId, [FromBody] RequestItem updatedRequest)
    {
        var integration = _service.GetById(id);
        if (integration == null) return NotFound("Integration not found");

        var existingRequest = integration.Requests.FirstOrDefault(r => r.Id == requestId);
        if (existingRequest == null) return NotFound("Request not found");

       
        existingRequest.Method = updatedRequest.Method;
        existingRequest.Url = updatedRequest.Url;
        existingRequest.Body = updatedRequest.Body;
        existingRequest.UseBearerToken = updatedRequest.UseBearerToken;
        existingRequest.HeadersJson = updatedRequest.HeadersJson;
        existingRequest.PlaceholderSource = updatedRequest.PlaceholderSource;

        _service.SaveChanges(); 
        return NoContent();
    }
}
