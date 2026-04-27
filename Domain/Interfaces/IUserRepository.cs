using KringeMusic.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User>? GetUserByEmail(string email);
        Task<User>? GetUserByLogin(string login);
        Task<User>? GetUserByLoginOrEmail(string identifier);
        Task CreateUser(User user);
    }
}
