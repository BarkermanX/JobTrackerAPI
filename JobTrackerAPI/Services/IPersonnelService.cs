using JobTrackerAPI.DTOs;
using JobTrackerAPI.Models;

namespace JobTrackerAPI.Services
{
    public interface IPersonnelService
    {
        IEnumerable<PersonnelSummaryDto> GetAll();
        Personnel? GetById(int id);
        Personnel Create(Personnel person);
    }
}