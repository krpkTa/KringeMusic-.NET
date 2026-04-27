using Domain.Interfaces;
using KringeMusic.Models;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;


namespace BusinessLogic
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordService _passwordService;

        public AuthService(IPasswordService passwordService, IUserRepository userRepository)
        {
            _passwordService = passwordService;
            _userRepository = userRepository;
        }

        public async Task<User?> Login(string username, string password)
        {
            var user = await _userRepository.GetUserByLoginOrEmail(username);

            if (user == null)
                return null;
            bool isPasswordValid = _passwordService.ValidatePassword(password, user.PasswordHash);
            if (!isPasswordValid) return null;

            return user;
        }

        public async Task<bool> Register(string login, string email, string password)
        {
            var existingUser = await _userRepository.GetUserByLoginOrEmail(login) ?? await _userRepository.GetUserByLoginOrEmail(email);

            if (existingUser != null) throw new Exception("Пользователь с таким логином или email уже существует");

            string passwordHash = _passwordService.GenerateHash(password);

            var newUser = new User
            {
                Login = login,
                Email = email,
                PasswordHash = passwordHash,
            };
            await _userRepository.CreateUser(newUser);

            return true;
        }

        public string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Login),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("role", user.Role.Name)
            };
            // добавить для этой строки конфигурацию
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("kringe-music-super-secret-key-1234567890-very-long-key"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "KringeMusic",
                audience: "KringeMusicClient",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: creds
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
