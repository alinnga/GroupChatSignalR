using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Linq;
using System.Web;
using GroupChatSignalR.Models;
using Microsoft.Ajax.Utilities;
using Microsoft.AspNet.SignalR;

namespace GroupChatSignalR.Hubs
{
    public class ChatHub : Hub
    {
        static List<User> Users = new List<User>();

        // Отправка сообщений
        public void Send(string name, string message, string groupName)
        {
            if (String.IsNullOrEmpty(message))
            {
                Clients.Caller().emptyMessage();
            }
            else
            {
                Clients.Group(groupName).addMessage(name, message);
            }
        }

        //Когда пользователь присоединяется к новой группе, старая группа забывается
        public void Join(string group)
        {
            List<User> usersOfGroup = new List<User>();
            String userName = "";
            bool isMod = false;
            var id = Context.ConnectionId;
            for(int i= 0; i<Users.Count; i++){
                if (Users[i].ConnectionId.Equals(id)){
                    if (!String.IsNullOrEmpty(Users[i].group))
                    {
                        Groups.Remove(Context.ConnectionId, Users[i].group);
                        Clients.Group(Users[i].group, id).removeByID(id);
                    }
                    isMod = Users[i].isMod;
                    Users[i].group = group;
                    userName = Users[i].Name;
                }
                else
                {
                    Console.WriteLine("Such user doesn't exist");
                }
            }
            Groups.Add(Context.ConnectionId, group);
            foreach (User u in Users)
            {
                if (u.group == group)
                {
                    usersOfGroup.Add(u);
                    if (u.ConnectionId != id)
                    {
                        if (u.isMod == true)
                        {
                            Clients.Client(u.ConnectionId).onNewUserConnected(id, userName, true);
                        }
                        else
                        {
                            Clients.Client(u.ConnectionId).onNewUserConnected(id, userName, false);
                        }
                    }
                    
                    
                }
            }
            // Посылаем сообщение о участниках группы текущему пользователю
            Clients.Caller.onConnected(id, userName, usersOfGroup, isMod);

        }

        public void deleteUsers(string id, string group)
        {
            foreach (User u in Users)
            {
                if (u.ConnectionId == id)
                {
                    u.group = null;
                }
            }
            Clients.Group(group).removeByID(id);
            Groups.Remove(id, group);
            Clients.Client(id).notification(group);
        }

        // Подключение нового пользователя
        public void Connect(string userName)
        {
            bool isMod = false;
            if (userName.ToLower().Equals("admin"))
            {
                isMod = true;
            }
            var id = Context.ConnectionId;
            List<User> usersOfGroup = new List<User>();
            if (!Users.Any(x => x.ConnectionId == id))
            {
                Users.Add(new User { ConnectionId = id, Name = userName, isMod = isMod});
                
            }
        }

        // Отключение пользователя
        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            var item = Users.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            if (item != null)
            {
                Users.Remove(item);
                var id = Context.ConnectionId;
                Clients.All.onUserDisconnected(id, item.Name);
            }

            return base.OnDisconnected(stopCalled);
        }
    }
}