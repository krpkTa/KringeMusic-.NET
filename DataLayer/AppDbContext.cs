using Domain;
using KringeMusic.Models;
using Microsoft.EntityFrameworkCore;

namespace DataLayer
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Artist> Artists { get; set; }
        public DbSet<RecordLabel> RecordLabels { get; set; }
        public DbSet<Track> Tracks { get; set; }
        public DbSet<Genre> Genres { get; set; }
        //public DbSet<Album> Albums { get; set; }
        public DbSet<ArtistTrack> ArtistTracks { get; set; }
        public DbSet<TrackGenre> TrackGenres { get; set; }
        public DbSet<ArtistGenre> ArtistGenres { get; set; }
        //public DbSet<AlbumTrack> AlbumTracks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Конфигурация User и Role (у вас уже есть)
            ConfigureUserAndRole(modelBuilder);

            // Конфигурация RecordLabel
            modelBuilder.Entity<RecordLabel>(entity =>
            {
                entity.ToTable("record_label");
                entity.HasKey(e => e.LabelId);
                entity.Property(e => e.LabelId).HasColumnName("label_id").UseIdentityColumn();
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Country).HasColumnName("country");
                entity.Property(e => e.CoverLink).HasColumnName("cover_link");
                
            });

            // Конфигурация Artist
            modelBuilder.Entity<Artist>(entity =>
            {
                entity.ToTable("artist");
                entity.HasKey(e => e.ArtistId);
                entity.Property(e => e.ArtistId).HasColumnName("artist_id").UseIdentityColumn();
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.CoverLink).HasColumnName("cover_link");
                entity.Property(e => e.LabelId).HasColumnName("label_id");

                entity.HasOne(e => e.Label)
                      .WithMany(l => l.Artists)
                      .HasForeignKey(e => e.LabelId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Конфигурация Track
            modelBuilder.Entity<Track>(entity =>
            {
                entity.ToTable("track");
                entity.HasKey(e => e.TrackId);
                entity.Property(e => e.TrackId).HasColumnName("track_id").UseIdentityColumn();
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Duration).HasColumnName("duration");
                entity.Property(e => e.ReleaseDate).HasColumnName("release_date");
                entity.Property(e => e.TrackLink).HasColumnName("track_link");
                entity.Property(e => e.CoverLink).HasColumnName("cover_link");
            });

            // Альбом (составной ключ)
            //modelBuilder.Entity<Album>(entity =>
            //{
            //    entity.ToTable("album");
            //    entity.HasKey(e => new { e.ArtistId, e.AlbumId });
            //    entity.Property(e => e.ArtistId).HasColumnName("artist_id");
            //    entity.Property(e => e.AlbumId).HasColumnName("album_id").UseIdentityColumn();
            //    entity.Property(e => e.Name).HasColumnName("name");
            //    entity.Property(e => e.ReleaseDate).HasColumnName("release_date");
            //    entity.Property(e => e.CoverLink).HasColumnName("cover_link");

            //    entity.HasOne(e => e.Artist)
            //          .WithMany(a => a.Albums)
            //          .HasForeignKey(e => e.ArtistId);
            //});

            // Связка Artist-Track
            modelBuilder.Entity<ArtistTrack>(entity =>
            {
                entity.ToTable("artist_tracks");
                entity.HasKey(e => new { e.TrackId, e.ArtistId });
                entity.Property(e => e.TrackId).HasColumnName("track_id");
                entity.Property(e => e.ArtistId).HasColumnName("artist_id");
                entity.Property(e => e.IsPrimary).HasColumnName("is_primary");

                entity.HasOne(e => e.Track)
                      .WithMany(t => t.ArtistTracks)
                      .HasForeignKey(e => e.TrackId);
                entity.HasOne(e => e.Artist)
                      .WithMany(a => a.ArtistTracks)
                      .HasForeignKey(e => e.ArtistId);
            });

            
            modelBuilder.Entity<Genre>(entity =>
            {
                entity.ToTable("genre");
                entity.HasKey(e => e.GenreId);
                entity.Property(e => e.GenreId).HasColumnName("genre_id").UseIdentityColumn();
                entity.Property(e => e.Name).HasColumnName("name");
            });

            modelBuilder.Entity<TrackGenre>(entity =>
            {
                entity.ToTable("track_genres");
                entity.HasKey(e => new { e.GenreId, e.TrackId });

                entity.Property(e => e.GenreId).HasColumnName("genre_id");
                entity.Property(e => e.TrackId).HasColumnName("track_id");

                entity.HasOne(e => e.Genre)
                      .WithMany(g => g.TrackGenres)
                      .HasForeignKey(e => e.GenreId);

                entity.HasOne(e => e.Track)
                      .WithMany(t => t.TrackGenres)
                      .HasForeignKey(e => e.TrackId);
            });

            modelBuilder.Entity<ArtistGenre>(entity =>
            {
                entity.ToTable("artist_genres");
                entity.HasKey(ag => new { ag.GenreId, ag.ArtistId });
                entity.Property(ag => ag.GenreId).HasColumnName("genre_id");
                entity.Property(ag => ag.ArtistId).HasColumnName("artist_id");

                entity.HasOne(ag => ag.Genre)
                      .WithMany(g => g.ArtistGenres)
                      .HasForeignKey(ag => ag.GenreId);

                entity.HasOne(ag => ag.Artist)
                      .WithMany(a => a.ArtistGenres)
                      .HasForeignKey(ag => ag.ArtistId);
            });

        }

        private void ConfigureUserAndRole(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(u => u.UserId);
                entity.Property(u => u.UserId).HasColumnName("user_id");
                entity.Property(u => u.Login).HasColumnName("login");
                entity.Property(u => u.Email).HasColumnName("email");
                entity.Property(u => u.PasswordHash).HasColumnName("password_hash");
                entity.Property(u => u.RoleId).HasColumnName("role_id");
                entity.HasOne(u => u.Role).WithMany().HasForeignKey(u => u.RoleId);
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("user_role");
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Id).HasColumnName("role_id");
                entity.Property(r => r.Name).HasColumnName("name");
            });
        }
    }
}