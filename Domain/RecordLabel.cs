using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class RecordLabel
    {
        public int LabelId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        // добавим поля для админки (нет в схеме, но на фронтенде есть)
        public int? FoundedYear { get; set; }
        public string? LogoLink { get; set; }   // логотип
        public string? Description { get; set; }

        public virtual ICollection<Artist> Artists { get; set; } = new List<Artist>();
    }
}
