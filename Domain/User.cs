using Domain;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KringeMusic.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("user_id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("login")]
        public string Login { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [EmailAddress]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [Column("role_id")]
        public int RoleId { get; set; } = 1;

        [ForeignKey("RoleId")]
        public Role? Role { get; set; }

        public virtual ICollection<UserGenre> UserGenres { get; set; } = new List<UserGenre>();
        public virtual ICollection<UserArtist> UserArtists { get; set; } = new List<UserArtist>();
    }
}