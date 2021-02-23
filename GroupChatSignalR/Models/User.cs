using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GroupChatSignalR.Models
{
    public class User
    {
        public string ConnectionId { get; set; }
        public string Name { get; set; }
        public String group { get; set; }
        public bool isMod { get; set; }  
    }
}