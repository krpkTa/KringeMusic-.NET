using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KringeMusic.Models;
using KringeMusic.DTOs;
using BusinessLogic;
using Domain.Interfaces;
using DataLayer;

namespace KringeMusic.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuthService _service;

        public AuthController(AppDbContext context, AuthService service)
        {
            _context = context;
            _service = service;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var isSuccess = await _service.Register(dto.Login, dto.Email, dto.Password);

            return Ok(new { message = "Регистрация успешна" });
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _service.Login(dto.Identifier, dto.Password);

            if (user == null) return Unauthorized("Неверный логин или пароль");

            var jwtToken = _service.GenerateToken(user);

            return Ok(new
            {
                message = "Вход успешен",
                token = jwtToken
            });
        }
    }
}
