using KringeMusic.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Domain.Interfaces;

namespace DataLayer
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<User>? GetUserByLogin(string login) => await _context.Users.FirstOrDefaultAsync(u => u.Login == login);
        
        public async Task<User>? GetUserByEmail(string email) => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        public async Task<User>? GetUserByLoginOrEmail(string identifier) => await _context.Users.Include(u=>u.Role).FirstOrDefaultAsync(u => u.Login == identifier || u.Email == identifier);
        public async Task CreateUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
    }
}
