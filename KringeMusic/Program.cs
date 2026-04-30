using Application;
using BusinessLogic;
using DataLayer;
using Domain.Interfaces;
using Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new Exception("Jwt:Key is missing");
var issuer = builder.Configuration["Jwt:Issuer"] ?? "KringeMusic";
var audience = builder.Configuration["Jwt:Audience"] ?? "KringeMusicClient";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DI
builder.Services.Configure<LocalStorageSettings>(builder.Configuration.GetSection("LocalStorage"));
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IStorageService, LocalFileStorage>();
builder.Services.AddScoped<IArtistRepository, ArtistRepository>();
builder.Services.AddScoped<IRecordLabelRepository, RecordLabelRepository>();
builder.Services.AddScoped<ITrackRepository, TrackRepository>();
builder.Services.AddScoped<IGenreRepository, GenreRepository>();
builder.Services.AddScoped<IAlbumRepository, AlbumRepository>();
builder.Services.AddScoped<IUserPreferencesRepository, UserPreferencesRepository>();
builder.Services.AddScoped<ISearchRepository, SearchRepository>();
builder.Services.AddScoped<IPlaylistRepository, PlaylistRepository>();
builder.Services.AddScoped<FavoritesService>();
builder.Services.AddScoped<SearchService>();
builder.Services.AddScoped<UserPreferencesService>();
builder.Services.AddScoped<AlbumService>();
builder.Services.AddScoped<GenreService>();
builder.Services.AddScoped<TrackService>();
builder.Services.AddScoped<ArtistService>();  
builder.Services.AddScoped<LabelService>();
builder.Services.AddScoped<AuthService>();


// DB
builder.Services.AddDbContext<DataLayer.AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Database")));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5174")  // URL твоего фронта (Vite по умолчанию 5173-5174)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();  // если используешь куки или авторизацию через токен в заголовке
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

app.Run();