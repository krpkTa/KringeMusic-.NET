using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IPasswordService
    {
        public bool ValidatePassword(string password, string hash);
        public string GenerateHash(string password);
    }
}
