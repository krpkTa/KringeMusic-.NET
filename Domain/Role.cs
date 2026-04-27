using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    [Table("user_role")]
    public class Role
    {
        [Column("role_id")]
        public int Id { get; set; }
        [Column("name")]
        public string Name { get; set; } = null!;
    }
}
