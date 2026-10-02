using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace JobTrackerAPI.Controllers
{
    [ApiController]
    public class ErrorController : ControllerBase
    {
        private readonly ILogger<ErrorController> logger;

        public ErrorController(ILogger<ErrorController> logger)
        {
            this.logger = logger;
        }

        [Route("/error")]
        public IActionResult HandleError()
        {
            var exception = HttpContext.Features
                .Get<IExceptionHandlerFeature>()?
                .Error;

            logger.LogError(
                exception,
                "An unhandled exception occurred.");

            return Problem(
                statusCode: 500,
                title: "Oooooops! An unexpected error occurred.");
        }
    }
}