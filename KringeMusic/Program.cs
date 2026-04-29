using Application;
using BusinessLogic;
using DataLayer;
using Domain.Interfaces;
using Infrastructure;
using KringeMusic.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

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
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

app.Run();