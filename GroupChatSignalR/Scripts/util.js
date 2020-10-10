$(function () {
    $('#joinBlock').hide();
    $('#chatBody').hide();
    $('#loginBlock').show();
    // Ссылка на автоматически-сгенерированный прокси хаба
    var chat = $.connection.chatHub;
    var nameofGroup = "undefined";
    var name = "undefined";
    // Объявление функции, которая хаб вызывает при получении сообщений
    chat.client.addMessage = function (name, message) {
        // Добавление сообщений на веб-страницу ser
        if (name.toLowerCase() == "admin") {
            $('#chatroom').append('<p id = messageAdmin ><b>' + htmlEncode(name)
                + '</b>: ' + htmlEncode(message) + '</p>');
        } else {
            $('#chatroom').append('<p id = message ><b>' + htmlEncode(name)
            + '</b>: ' + htmlEncode(message) + '</p>');
        }
        
    };
    chat.client.removeByID = function (id) {
        // Добавление сообщений на веб-страницу ser
        $('#' + id).remove();
    };
    // Функция, вызываемая при подключении нового пользователя
    chat.client.onConnected = function (id, userName, allUsers, isMod) {

        $('#chatBody').show();
        // установка в скрытых полях имени и id текущего пользователя
        $('#hdId').val(id);
        $('#username').val(userName);
        $('#header').html('<h3>Добро пожаловать, ' + userName + '</h3>');

        // Добавление всех пользователей
        for (i = 0; i < allUsers.length; i++) {

            AddUser(allUsers[i].ConnectionId, allUsers[i].Name, isMod);
        }
    }

    // Добавляем нового пользователя
    chat.client.onNewUserConnected = function (id, name, isMod) {

        AddUser(id, name, isMod);
    }
    chat.client.notification = function (group) {

        alert("Вы были удалены из группы " + group);
        $('#chatBody').hide();
    }

    // Удаляем пользователя
    chat.client.onUserDisconnected = function (id, userName) {

        $('#' + id).remove();
    }

    // Открываем соединение
    $.connection.hub.start().done(function () {

        $('#sendmessage').click(function () {
            // Вызываем у хаба метод Send
            chat.server.send($('#username').val(), $('#message').val(), $('#group').val());
            $('#message').val('');
        });

        $('#join').click(function () {
            // Вызываем у хаба метод Send
            nameofGroup = $('#group').val();
            $('.us').remove();
            chat.server.join($('#group').val());
            $('#chatroom').append('<p><b>' + htmlEncode("вы успешно присоединились к группе ") + htmlEncode(nameofGroup)+ '</b>' + '</p>');
        });
        $(document).on("click", ".delete", function () {
            //$("#" + this.id).remove();
            chat.server.deleteUsers(this.id, nameofGroup);
        });

        //$('#showGroup').click(function () {
        //    // Вызываем у хаба метод Send
        //    $.getJSON(apiUrl)
        //        .done(function (data) {
        //            // On success, 'data' contains a list of products.
        //            $.each(data, function (key, item) {
        //                // Add a list item for the product.
        //                $('<li>', { text: formatItem(item) }).appendTo($('#products'));
        //            });
        //        });
        //});

        // обработка логина
        $("#btnLogin").click(function () {

            name = $("#txtUserName").val();
            if (name.length > 0) {
                chat.server.connect(name);
                $('#loginBlock').hide();
                $('#joinBlock').show();
            }
            else {
                alert("Введите имя");
            }
        });
    });
});
// Кодирование тегов
function htmlEncode(value) {
    var encodedValue = $('<div />').text(value).html();
    return encodedValue;
}
//Добавление нового пользователя
function AddUser(id, name, isMod) {

    var userId = $('#hdId').val();
    
    if (userId != id) {
        if (isMod) {
            $("#chatusers").append('<p id="' + id + '" class = "us" ><b>' + name + '  </b><button class = "delete" id ="'+id+'" border = "0" >X</button></p>');
        }
        else {
            $("#chatusers").append('<p id="' + id + '" class = "us" ><b>' + name + '</p>');
        }
        
    }
}
