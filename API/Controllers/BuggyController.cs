using System;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class BuggyController : BaseApiController
{
    [HttpGet("auth")]
    public IActionResult GetAuth()
    {
        return Unauthorized("You are not authorized to access this resource.");
    }


    [HttpGet("not-found")]
    public IActionResult GetNotFound()
    {
        return NotFound("The requested resource was not found.");
    }


    [HttpGet("server-error")]
    public IActionResult GetServerError()
    {
        throw new Exception("This is a server error.");
    }


    [HttpGet("bad-request")]
    public IActionResult GetBadRequest()
    {
        return BadRequest("This was not the good request.");
    }
}