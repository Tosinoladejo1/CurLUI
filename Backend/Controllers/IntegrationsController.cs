using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
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
    /// <summary>
    /// Get all integrations.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public IActionResult GetAll() => Ok(_service.GetAll());

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        var integration = _service.GetById(id);
        if (integration == null) return NotFound();
        return Ok(integration);
    }

    [HttpPost]
    public IActionResult Create(Integration integration)
    {
        integration.Id = Guid.NewGuid();
        _service.Add(integration);
        return CreatedAtAction(nameof(Get), new { id = integration.Id }, integration);
    }

    [HttpPut("{id}")]
    public IActionResult Update(Guid id, Integration integration)
    {
        if (id != integration.Id) return BadRequest();
        _service.Update(integration);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        _service.Delete(id);
        return NoContent();
    }

    [HttpPost("run/{id}")]

    public async Task<IActionResult> Run(Guid id, [FromBody] Dictionary<string, string> runtimeValues)
    {
        var integration = _service.GetById(id);
        if (integration == null) return NotFound();

        var result = await _runner.RunIntegrationAsync(integration, runtimeValues);
        return Ok(result);
    }
}