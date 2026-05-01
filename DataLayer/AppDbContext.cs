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
        public DbSet<Album> Albums { get; set; }
        public DbSet<ArtistTrack> ArtistTracks { get; set; }
        public DbSet<TrackGenre> TrackGenres { get; set; }
        public DbSet<ArtistGenre> ArtistGenres { get; set; }
        public DbSet<AlbumTrack> AlbumTracks { get; set; }
        public DbSet<UserArtist> UserArtists { get; set; }
        public DbSet<UserGenre> UserGenres { get; set; }
        public DbSet<Playlist> Playlists { get; set; }
        public DbSet<PlaylistType> PlaylistTypes { get; set; }
        public DbSet<PlaylistTrack> PlaylistTracks { get; set; }
        public DbSet<UserAlbum> UserAlbums { get; set; }
        public DbSet<PlayedHistory> PlayedHistory { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ConfigureUserAndRole(modelBuilder);

            modelBuilder.Entity<RecordLabel>(entity =>
            {
                entity.ToTable("record_label");
                entity.HasKey(e => e.LabelId);
                entity.Property(e => e.LabelId).HasColumnName("label_id").UseIdentityColumn();
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Country).HasColumnName("country");
                entity.Property(e => e.CoverLink).HasColumnName("cover_link");
                
            });

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

            modelBuilder.Entity<Album>(entity =>
            {
                entity.ToTable("album");
                entity.HasKey(e => new { e.ArtistId, e.AlbumId });
                entity.Property(e => e.ArtistId).HasColumnName("artist_id");
                entity.Property(e => e.AlbumId).HasColumnName("album_id").UseIdentityColumn();
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.ReleaseDate).HasColumnName("release_date");
                entity.Property(e => e.CoverLink).HasColumnName("cover_link");

                entity.HasOne(e => e.Artist)
                      .WithMany(a => a.Albums)
                      .HasForeignKey(e => e.ArtistId);
            });

            modelBuilder.Entity<AlbumTrack>(entity =>
            {
                entity.ToTable("album_tracks");
                entity.HasKey(e => new { e.ArtistId, e.AlbumId, e.TrackId });

                entity.Property(e => e.ArtistId).HasColumnName("artist_id");
                entity.Property(e => e.AlbumId).HasColumnName("album_id");
                entity.Property(e => e.TrackId).HasColumnName("track_id");

                entity.HasOne(e => e.Album)
                      .WithMany(a => a.AlbumTracks)
                      .HasForeignKey(e => new { e.ArtistId, e.AlbumId })
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Track)
                      .WithMany(t => t.AlbumTracks)
                      .HasForeignKey(e => e.TrackId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

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

            modelBuilder.Entity<UserGenre>(entity =>
            {
                entity.ToTable("user_genres");
                entity.HasKey(ug => new { ug.GenreId, ug.UserId });
                entity.Property(ug => ug.GenreId).HasColumnName("genre_id");
                entity.Property(ug => ug.UserId).HasColumnName("user_id");

                entity.HasOne(ug => ug.Genre)
                      .WithMany()
                      .HasForeignKey(ug => ug.GenreId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ug => ug.User)
                      .WithMany(u => u.UserGenres)
                      .HasForeignKey(ug => ug.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });


            modelBuilder.Entity<UserArtist>(entity =>
            {
                entity.ToTable("user_artist");
                entity.HasKey(ua => new { ua.ArtistId, ua.UserId });
                entity.Property(ua => ua.ArtistId).HasColumnName("artist_id");
                entity.Property(ua => ua.UserId).HasColumnName("user_id");

                entity.HasOne(ua => ua.Artist)
                      .WithMany()
                      .HasForeignKey(ua => ua.ArtistId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ua => ua.User)
                      .WithMany(u => u.UserArtists)
                      .HasForeignKey(ua => ua.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PlaylistType>(entity =>
            {
                entity.ToTable("playlist_type");
                entity.HasKey(e => e.TypeId);
                entity.Property(e => e.TypeId).HasColumnName("type_id").ValueGeneratedNever(); // или UseIdentityColumn, если автоинкремент
                entity.Property(e => e.Name).HasColumnName("name");
            });

            modelBuilder.Entity<Playlist>(entity =>
            {
                entity.ToTable("playlist");
                entity.HasKey(e => new { e.TypeId, e.UserId, e.PlaylistId });
                entity.Property(e => e.TypeId).HasColumnName("type_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.PlaylistId).HasColumnName("playlist_id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");

                entity.HasOne(e => e.Type)
                      .WithMany(t => t.Playlists)
                      .HasForeignKey(e => e.TypeId);

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Playlists) 
                      .HasForeignKey(e => e.UserId);
            });

            modelBuilder.Entity<PlaylistTrack>(entity =>
            {
                entity.ToTable("playlist_tracks");
                entity.HasKey(e => new { e.TrackId, e.TypeId, e.UserId, e.PlaylistId });
                entity.Property(e => e.TrackId).HasColumnName("track_id");
                entity.Property(e => e.TypeId).HasColumnName("type_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.PlaylistId).HasColumnName("playlist_id");
                entity.Property(e => e.AddedAt).HasColumnName("added_at");

                entity.HasOne(e => e.Track)
                      .WithMany(t => t.PlaylistTracks) 
                      .HasForeignKey(e => e.TrackId);

                entity.HasOne(e => e.Playlist)
                      .WithMany(p => p.PlaylistTracks)
                      .HasForeignKey(e => new { e.TypeId, e.UserId, e.PlaylistId });
            });

            modelBuilder.Entity<UserAlbum>(entity =>
            {
                entity.ToTable("user_albums");
                entity.HasKey(e => new { e.ArtistId, e.AlbumId, e.UserId });

                entity.Property(e => e.ArtistId).HasColumnName("artist_id");
                entity.Property(e => e.AlbumId).HasColumnName("album_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");

                entity.HasOne(e => e.Album)
                      .WithMany()
                      .HasForeignKey(e => new { e.ArtistId, e.AlbumId })
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict); 
            });

            modelBuilder.Entity<PlayedHistory>(entity =>
            {
                entity.ToTable("played_history");
                entity.HasKey(e => e.HistoryId);
                entity.Property(e => e.HistoryId)
                      .HasColumnName("history_id")
                      .UseIdentityColumn();   

                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.TrackId).HasColumnName("track_id");
                entity.Property(e => e.Source).HasColumnName("source");
                entity.Property(e => e.DurationPlayed).HasColumnName("duration_played");
                entity.Property(e => e.IsSkipped).HasColumnName("is_skipped");
                entity.Property(e => e.ListeningDate).HasColumnName("listening_date");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Track)
                      .WithMany()
                      .HasForeignKey(e => e.TrackId)
                      .OnDelete(DeleteBehavior.Cascade);
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