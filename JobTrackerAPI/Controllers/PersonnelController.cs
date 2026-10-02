using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobTrackerAPI.DTOs;
using JobTrackerAPI.Models;
using JobTrackerAPI.Services;

namespace JobTrackerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PersonnelController : ControllerBase
    {
        private readonly IPersonnelService personnelService;

        public PersonnelController(IPersonnelService personnelService)
        {
            this.personnelService = personnelService;
        }

        [Authorize]
        [HttpGet(Name = "GetAllPersonnel")]
        public IEnumerable<PersonnelSummaryDto> Get()
        {
            return personnelService.GetAll();
        }

        [Authorize]
        [HttpGet("{p_strID}", Name = "GetPersonnelById")]
        public ActionResult<Personnel> GetPersonnelById(string p_strID)
        {
            if (!int.TryParse(p_strID, out int id))
            {
                return BadRequest("Invalid id.");
            }

            var person = personnelService.GetById(id);

            if (person == null)
            {
                return NotFound("Personnel not found.");
            }

            return person;
        }

        [Authorize(Policy = "CanManagePersonnel")]
        [HttpPost]
        public ActionResult<Personnel> Create(Personnel objPerson)
        {
            var person = personnelService.Create(objPerson);

            return CreatedAtAction(
                nameof(GetPersonnelById),
                new { p_strID = person.PersonnelId },
                person);
        }
    }
}