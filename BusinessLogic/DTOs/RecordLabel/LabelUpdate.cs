using KringeMusic.DTOs.RecordLabel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.RecordLabel
{
    public class LabelUpdateDto : LabelCreateDto
    {
        public int LabelId { get; set; }
    }
}
