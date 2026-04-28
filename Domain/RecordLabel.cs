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
        public string? CoverLink { get; set; }
        public virtual ICollection<Artist> Artists { get; set; } = new List<Artist>();
    }
}
