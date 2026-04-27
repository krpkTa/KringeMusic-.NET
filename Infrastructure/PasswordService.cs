using BCrypt.Net;
using Domain.Interfaces;

namespace Infrastructure
{
    public class PasswordService : IPasswordService
    {
        public string GenerateHash(string password) => BCrypt.Net.BCrypt.HashPassword(password);
        public bool ValidatePassword(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
    
    }
}
