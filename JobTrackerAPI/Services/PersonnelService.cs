using Microsoft.EntityFrameworkCore;
using JobTrackerAPI.Data;
using JobTrackerAPI.Models;
using JobTrackerAPI.DTOs;

namespace JobTrackerAPI.Services
{
    public class PersonnelService : IPersonnelService
    {
        private readonly PersonnelDbContext context;

        public PersonnelService(PersonnelDbContext context)
        {
            this.context = context;
        }

        public IEnumerable<PersonnelSummaryDto> GetAll()
        {
            //return context.Personnel.ToList();
            return context.Personnel
                .Select(p => new PersonnelSummaryDto
                {
                    PersonnelId = p.PersonnelId,
                    Reference = p.Reference,
                    FirstName = p.FirstName,
                    LastName = p.LastName,
                    Email = p.Email
                })
                .ToList();
        }

        public Personnel? GetById(int id)
        {
            return context.Personnel
                .FirstOrDefault(p => p.PersonnelId == id);
        }

        public Personnel Create(Personnel person)
        {
            context.Personnel.Add(person);
            context.SaveChanges();

            return person;
        }
    }
}