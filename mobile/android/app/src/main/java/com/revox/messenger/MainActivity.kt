package com.revox.messenger

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

private const val API = "https://revox-yuyn.onrender.com"

private val Bg = Color(0xFF090711)
private val Panel = Color(0xFF171225)
private val Purple = Color(0xFF9B5CFF)
private val Cyan = Color(0xFF62E5FF)
private val White = Color(0xFFF5F1FF)
private val Muted = Color(0xFFAAA1BE)

private data class Person(
    val id: Int,
    val username: String,
    val name: String,
    val email: String
)

private data class ChatItem(
    val id: Int,
    val name: String,
    val username: String,
    val lastMessage: String
)

private data class MessageItem(
    val id: Int,
    val senderId: Int,
    val text: String,
    val createdAt: String
)

private suspend fun api(
    path: String,
    method: String = "GET",
    token: String? = null,
    body: JSONObject? = null
): JSONObject = withContext(Dispatchers.IO) {
    val connection = (URL(API + path).openConnection() as HttpURLConnection)
    try {
        connection.requestMethod = method
        connection.connectTimeout = 15000
        connection.readTimeout = 20000
        connection.setRequestProperty("Accept", "application/json")
        if (token != null) {
            connection.setRequestProperty("Authorization", "Bearer $token")
        }
        if (body != null) {
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json; charset=utf-8")
            connection.outputStream.use {
                it.write(body.toString().toByteArray(Charsets.UTF_8))
            }
        }
        val code = connection.responseCode
        val stream = if (code in 200..299) connection.inputStream else connection.errorStream
        val text = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
        val result = try {
            JSONObject(text)
        } catch (_: Exception) {
            JSONObject().put("message", text.ifBlank { "HTTP $code" })
        }
        if (code !in 200..299) {
            throw IllegalStateException(
                result.optString("error").ifBlank {
                    result.optString("message").ifBlank { "Ошибка сервера: HTTP $code" }
                }
            )
        }
        result
    } finally {
        connection.disconnect()
    }
}

private fun JSONObject.toPerson(): Person = Person(
    id = optInt("id"),
    username = optString("username"),
    name = listOf(optString("first_name"), optString("last_name"))
        .filter { it.isNotBlank() && it != "null" }
        .joinToString(" ")
        .ifBlank { optString("username").ifBlank { optString("email") } },
    email = optString("email")
)

private fun JSONObject.toChat(): ChatItem = ChatItem(
    id = optInt("id"),
    name = listOf(optString("first_name"), optString("last_name"))
        .filter { it.isNotBlank() && it != "null" }
        .joinToString(" ")
        .ifBlank { optString("username").ifBlank { "Пользователь" } },
    username = optString("username"),
    lastMessage = optString("last_message").takeIf { it != "null" }.orEmpty()
)

private fun JSONObject.toMessage(): MessageItem = MessageItem(
    id = optInt("id"),
    senderId = optInt("sender_id"),
    text = optString("text"),
    createdAt = optString("created_at")
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { RevOxApp() }
    }
}

@Composable
private fun RevOxApp() {
    val context = LocalContext.current
    val prefs = remember {
        context.getSharedPreferences("revox_session", Context.MODE_PRIVATE)
    }
    val scope = rememberCoroutineScope()

    var token by remember { mutableStateOf(prefs.getString("token", null)) }
    var myId by remember { mutableIntStateOf(prefs.getInt("user_id", 0)) }
    var myName by remember { mutableStateOf(prefs.getString("name", "") ?: "") }
    var myUsername by remember { mutableStateOf(prefs.getString("username", "") ?: "") }
    var myEmail by remember { mutableStateOf(prefs.getString("email", "") ?: "") }

    var page by remember { mutableStateOf("auth") }
    var tab by remember { mutableStateOf("chats") }
    var authStep by remember { mutableStateOf("email") }

    var email by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    var search by remember { mutableStateOf("") }
    var people by remember { mutableStateOf(listOf<Person>()) }
    var chats by remember { mutableStateOf(listOf<ChatItem>()) }
    var messages by remember { mutableStateOf(listOf<MessageItem>()) }
    var activeChat by remember { mutableStateOf<ChatItem?>(null) }
    var messageText by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }

    fun logout() {
        prefs.edit().clear().apply()
        token = null
        myId = 0
        myName = ""
        myUsername = ""
        myEmail = ""
        page = "auth"
        tab = "chats"
        activeChat = null
        error = ""
    }

    fun saveSession(result: JSONObject) {
        val newToken = result.optString("token")
        if (newToken.isBlank() || newToken == "null") {
            error = "Сервер не вернул токен авторизации."
            return
        }
        val user = result.optJSONObject("user") ?: JSONObject()
        token = newToken
        myId = user.optInt("id")
        myName = listOf(user.optString("first_name"), user.optString("last_name"))
            .filter { it.isNotBlank() && it != "null" }
            .joinToString(" ")
            .ifBlank { user.optString("username") }
        myUsername = user.optString("username")
        myEmail = user.optString("email").ifBlank { email.trim() }
        prefs.edit()
            .putString("token", newToken)
            .putInt("user_id", myId)
            .putString("name", myName)
            .putString("username", myUsername)
            .putString("email", myEmail)
            .apply()
        page = "home"
        error = ""
    }

    suspend fun loadChats() {
        val currentToken = token ?: return
        val result = api("/api/chats", token = currentToken)
        val array = result.optJSONArray("chats") ?: JSONArray()
        chats = (0 until array.length()).mapNotNull {
            array.optJSONObject(it)?.toChat()
        }
    }

    suspend fun loadMessages(chat: ChatItem) {
        val currentToken = token ?: return
        val result = api("/api/messages/${chat.id}", token = currentToken)
        val array = result.optJSONArray("messages") ?: JSONArray()
        messages = (0 until array.length()).mapNotNull {
            array.optJSONObject(it)?.toMessage()
        }
    }

    LaunchedEffect(token) {
        if (token != null) {
            try {
                val me = api("/api/user/me", token = token)
                val user = me.optJSONObject("user") ?: JSONObject()
                myId = user.optInt("id")
                myName = listOf(user.optString("first_name"), user.optString("last_name"))
                    .filter { it.isNotBlank() && it != "null" }
                    .joinToString(" ")
                    .ifBlank { user.optString("username") }
                myUsername = user.optString("username")
                myEmail = user.optString("email")
                prefs.edit()
                    .putInt("user_id", myId)
                    .putString("name", myName)
                    .putString("username", myUsername)
                    .putString("email", myEmail)
                    .apply()
                page = "home"
                loadChats()
            } catch (e: Exception) {
                error = e.message ?: "Не удалось подключиться"
                if (error.contains("token", true) ||
                    error.contains("unauthorized", true) ||
                    error.contains("авторизац", true)
                ) logout()
            }
        } else {
            page = "auth"
        }
    }

    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Purple,
            secondary = Cyan,
            background = Bg,
            surface = Panel,
            onPrimary = Color.White,
            onBackground = White,
            onSurface = White
        )
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Bg
        ) {
            when {
                page == "auth" -> AuthScreen(
                    step = authStep,
                    email = email,
                    onEmail = { email = it },
                    code = code,
                    onCode = { code = it },
                    firstName = firstName,
                    onFirstName = { firstName = it },
                    lastName = lastName,
                    onLastName = { lastName = it },
                    username = username,
                    onUsername = { username = it },
                    password = password,
                    onPassword = { password = it },
                    loading = loading,
                    error = error,
                    onClearError = { error = "" },
                    onSendCode = {
                        scope.launch {
                            loading = true
                            error = ""
                            try {
                                val result = api(
                                    "/api/auth/check",
                                    method = "POST",
                                    body = JSONObject().put("email", email.trim())
                                )
                                val exists = result.optBoolean("exists")
                                api(
                                    "/api/auth/register",
                                    method = "POST",
                                    body = JSONObject().put("email", email.trim())
                                )
                                authStep = if (exists) "login" else "verify"
                            } catch (e: Exception) {
                                error = e.message ?: "Не удалось отправить код"
                            } finally {
                                loading = false
                            }
                        }
                    },
                    onVerify = {
                        scope.launch {
                            loading = true
                            error = ""
                            try {
                                val result = api(
                                    "/api/auth/verify",
                                    method = "POST",
                                    body = JSONObject()
                                        .put("email", email.trim())
                                        .put("code", code.trim())
                                )
                                if (result.optBoolean("needsRegistration") ||
                                    result.optBoolean("success")
                                ) {
                                    authStep = if (result.optBoolean("needsRegistration")) {
                                        "register"
                                    } else if (result.has("token")) {
                                        saveSession(result)
                                        "done"
                                    } else {
                                        "register"
                                    }
                                } else {
                                    error = "Код не подтверждён"
                                }
                            } catch (e: Exception) {
                                error = e.message ?: "Не удалось проверить код"
                            } finally {
                                loading = false
                            }
                        }
                    },
                    onFinishRegistration = {
                        scope.launch {
                            loading = true
                            error = ""
                            try {
                                val result = api(
                                    "/api/auth/complete-registration",
                                    method = "POST",
                                    body = JSONObject()
                                        .put("email", email.trim())
                                        .put("firstName", firstName.trim())
                                        .put("lastName", lastName.trim())
                                        .put("username", username.trim())
                                        .put("password", password)
                                )
                                saveSession(result)
                            } catch (e: Exception) {
                                error = e.message ?: "Не удалось создать аккаунт"
                            } finally {
                                loading = false
                            }
                        }
                    },
                    onLogin = {
                        scope.launch {
                            loading = true
                            error = ""
                            try {
                                val result = api(
                                    "/api/auth/login",
                                    method = "POST",
                                    body = JSONObject()
                                        .put("email", email.trim())
                                        .put("password", password)
                                )
                                saveSession(result)
                            } catch (e: Exception) {
                                error = e.message ?: "Не удалось войти"
                            } finally {
                                loading = false
                            }
                        }
                    }
                )

                page == "home" && activeChat != null -> ChatScreen(
                    chat = activeChat!!,
                    messages = messages,
                    myId = myId,
                    text = messageText,
                    onText = { messageText = it },
                    loading = loading,
                    error = error,
                    onBack = {
                        activeChat = null
                        error = ""
                        scope.launch {
                            try { loadChats() } catch (_: Exception) {}
                        }
                    },
                    onRefresh = {
                        scope.launch {
                            try { loadMessages(activeChat!!) }
                            catch (e: Exception) { error = e.message ?: "Ошибка загрузки" }
                        }
                    },
                    onSend = {
                        val chat = activeChat ?: return@ChatScreen
                        val textToSend = messageText.trim()
                        if (textToSend.isNotEmpty()) {
                            scope.launch {
                                loading = true
                                error = ""
                                try {
                                    api(
                                        "/api/messages/send",
                                        method = "POST",
                                        token = token,
                                        body = JSONObject()
                                            .put("chatId", chat.id)
                                            .put("text", textToSend)
                                    )
                                    messageText = ""
                                    loadMessages(chat)
                                    loadChats()
                                } catch (e: Exception) {
                                    error = e.message ?: "Не удалось отправить сообщение"
                                } finally {
                                    loading = false
                                }
                            }
                        }
                    }
                )

                page == "home" -> HomeScreen(
                    tab = tab,
                    onTab = {
                        tab = it
                        error = ""
                        if (it == "chats") {
                            scope.launch {
                                loading = true
                                try { loadChats() }
                                catch (e: Exception) { error = e.message ?: "Ошибка загрузки чатов" }
                                finally { loading = false }
                            }
                        }
                    },
                    chats = chats,
                    people = people,
                    search = search,
                    onSearch = { search = it },
                    myName = myName,
                    myUsername = myUsername,
                    myEmail = myEmail,
                    loading = loading,
                    error = error,
                    onRefresh = {
                        scope.launch {
                            loading = true
                            error = ""
                            try {
                                if (tab == "chats") loadChats()
                                else {
                                    val q = search.trim()
                                    if (q.isNotEmpty()) {
                                        val result = api(
                                            "/api/user/search?q=${java.net.URLEncoder.encode(q, "UTF-8")}",
                                            token = token
                                        )
                                        val array = result.optJSONArray("users") ?: JSONArray()
                                        people = (0 until array.length()).mapNotNull {
                                            array.optJSONObject(it)?.toPerson()
                                        }
                                    } else people = emptyList()
                                }
                            } catch (e: Exception) {
                                error = e.message ?: "Ошибка запроса"
                            } finally {
                                loading = false
                            }
                        }
                    },
                    onOpenChat = { chat ->
                        activeChat = chat
                        messages = emptyList()
                        page = "home"
                        scope.launch {
                            loading = true
                            error = ""
                            try { loadMessages(chat) }
                            catch (e: Exception) { error = e.message ?: "Не удалось загрузить сообщения" }
                            finally { loading = false }
                        }
                    },
                    onStartChat = { person ->
                        scope.launch {
                            loading = true
                            error = ""
                            try {
                                val result = api(
                                    "/api/chats/create",
                                    method = "POST",
                                    token = token,
                                    body = JSONObject().put("userId", person.id)
                                )
                                val chatId = result.optInt("chat_id")
                                if (chatId <= 0) error = "Сервер не вернул ID чата"
                                else {
                                    val chat = ChatItem(chatId, person.name, person.username, "")
                                    activeChat = chat
                                    loadMessages(chat)
                                }
                            } catch (e: Exception) {
                                error = e.message ?: "Не удалось создать чат"
                            } finally {
                                loading = false
                            }
                        }
                    },
                    onLogout = { logout() },
                    onSaveProfile = { newName, newUsername ->
                        scope.launch {
                            loading = true
                            error = ""
                            try {
                                val parts = newName.trim().split(Regex("\\s+"), limit = 2)
                                api(
                                    "/api/user/update",
                                    method = "PUT",
                                    token = token,
                                    body = JSONObject()
                                        .put("first_name", parts.firstOrNull().orEmpty())
                                        .put("last_name", parts.getOrNull(1).orEmpty())
                                        .put("username", newUsername.trim())
                                        .put("avatar", "")
                                )
                                myName = newName.trim()
                                myUsername = newUsername.trim()
                                prefs.edit()
                                    .putString("name", myName)
                                    .putString("username", myUsername)
                                    .apply()
                            } catch (e: Exception) {
                                error = e.message ?: "Не удалось сохранить профиль"
                            } finally {
                                loading = false
                            }
                        }
                    }
                )
            }
        }
    }
}

@Composable
private fun AuthScreen(
    step: String,
    email: String,
    onEmail: (String) -> Unit,
    code: String,
    onCode: (String) -> Unit,
    firstName: String,
    onFirstName: (String) -> Unit,
    lastName: String,
    onLastName: (String) -> Unit,
    username: String,
    onUsername: (String) -> Unit,
    password: String,
    onPassword: (String) -> Unit,
    loading: Boolean,
    error: String,
    onClearError: () -> Unit,
    onSendCode: () -> Unit,
    onVerify: () -> Unit,
    onFinishRegistration: () -> Unit,
    onLogin: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("R", color = Purple, fontSize = 72.sp, fontWeight = FontWeight.Black)
        Text("RevOx", color = White, fontSize = 34.sp, fontWeight = FontWeight.Bold)
        Text("ТВОЁ ПРОСТРАНСТВО ОБЩЕНИЯ", color = Cyan, fontSize = 11.sp)
        Spacer(Modifier.height(28.dp))
        Text(
            when (step) {
                "verify" -> "Подтверждение почты"
                "register" -> "Создание аккаунта"
                "login" -> "С возвращением"
                else -> "Войти или зарегистрироваться"
            },
            color = White,
            fontSize = 21.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(Modifier.height(18.dp))

        when (step) {
            "email" -> {
                RevField(email, onEmail, "Электронная почта", keyboard = KeyboardType.Email)
                Spacer(Modifier.height(12.dp))
                RevButton("Продолжить", loading, onSendCode)
            }
            "verify" -> {
                Text(email, color = Muted)
                Spacer(Modifier.height(12.dp))
                RevField(code, onCode, "Код из письма", keyboard = KeyboardType.Number)
                Spacer(Modifier.height(12.dp))
                RevButton("Подтвердить код", loading, onVerify)
            }
            "register" -> {
                RevField(firstName, onFirstName, "Имя")
                Spacer(Modifier.height(8.dp))
                RevField(lastName, onLastName, "Фамилия")
                Spacer(Modifier.height(8.dp))
                RevField(username, onUsername, "Имя пользователя")
                Spacer(Modifier.height(8.dp))
                RevField(password, onPassword, "Пароль", password = true)
                Spacer(Modifier.height(12.dp))
                RevButton("Создать аккаунт", loading, onFinishRegistration)
            }
            "login" -> {
                Text(email, color = Muted)
                Spacer(Modifier.height(12.dp))
                RevField(password, onPassword, "Пароль", password = true)
                Spacer(Modifier.height(12.dp))
                RevButton("Войти", loading, onLogin)
            }
        }
        if (error.isNotBlank()) {
            Spacer(Modifier.height(14.dp))
            Text(error, color = Color(0xFFFF7D9D), fontSize = 13.sp)
            Text(
                "Скрыть",
                color = Muted,
                modifier = Modifier.clickable { onClearError() }.padding(8.dp)
            )
        }
    }
}

@Composable
private fun HomeScreen(
    tab: String,
    onTab: (String) -> Unit,
    chats: List<ChatItem>,
    people: List<Person>,
    search: String,
    onSearch: (String) -> Unit,
    myName: String,
    myUsername: String,
    myEmail: String,
    loading: Boolean,
    error: String,
    onRefresh: () -> Unit,
    onOpenChat: (ChatItem) -> Unit,
    onStartChat: (Person) -> Unit,
    onLogout: () -> Unit,
    onSaveProfile: (String, String) -> Unit
) {
    var editName by remember(myName) { mutableStateOf(myName) }
    var editUsername by remember(myUsername) { mutableStateOf(myUsername) }

    Column(Modifier.fillMaxSize()) {
        Column(
            Modifier.fillMaxWidth().background(Panel).padding(horizontal = 20.dp, vertical = 18.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("R", color = Purple, fontSize = 34.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Text("RevOx", color = White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                    Text(
                        when (tab) {
                            "chats" -> "Сообщения"
                            "contacts" -> "Контакты"
                            else -> "Твой профиль"
                        },
                        color = Muted,
                        fontSize = 12.sp
                    )
                }
                TextButton(onClick = onRefresh, enabled = !loading) {
                    Text("↻", color = Cyan, fontSize = 24.sp)
                }
            }
        }

        when (tab) {
            "chats" -> {
                if (chats.isEmpty() && !loading) {
                    EmptyState("Пока нет чатов", "Открой контакты и начни общение")
                }
                LazyColumn(
                    modifier = Modifier.weight(1f).fillMaxWidth(),
                    contentPadding = PaddingValues(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(chats, key = { it.id }) { chat ->
                        Row(
                            Modifier.fillMaxWidth()
                                .background(Panel, RoundedCornerShape(16.dp))
                                .clickable { onOpenChat(chat) }
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Avatar(chat.name)
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(chat.name, color = White, fontWeight = FontWeight.SemiBold)
                                Text(
                                    chat.lastMessage.ifBlank { "@${chat.username}".trimEnd('@') },
                                    color = Muted,
                                    fontSize = 13.sp,
                                    maxLines = 1
                                )
                            }
                            Text("›", color = Purple, fontSize = 28.sp)
                        }
                    }
                }
            }

            "contacts" -> {
                Column(Modifier.padding(16.dp)) {
                    RevField(search, onSearch, "Поиск по имени или username")
                    Spacer(Modifier.height(8.dp))
                    RevButton("Найти людей", loading, onRefresh)
                    if (people.isEmpty() && !loading) {
                        Text(
                            "Найди пользователя, чтобы начать переписку.",
                            color = Muted,
                            modifier = Modifier.padding(top = 16.dp)
                        )
                    }
                }
                LazyColumn(
                    modifier = Modifier.weight(1f).fillMaxWidth(),
                    contentPadding = PaddingValues(horizontal = 14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(people, key = { it.id }) { person ->
                        Row(
                            Modifier.fillMaxWidth()
                                .background(Panel, RoundedCornerShape(14.dp))
                                .clickable { onStartChat(person) }
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Avatar(person.name)
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(person.name, color = White, fontWeight = FontWeight.Medium)
                                Text(
                                    if (person.username.isNotBlank()) "@${person.username}" else person.email,
                                    color = Muted,
                                    fontSize = 12.sp
                                )
                            }
                            Text("+", color = Cyan, fontSize = 26.sp)
                        }
                    }
                }
            }

            else -> {
                Column(
                    Modifier.weight(1f).fillMaxWidth().padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("ПРОФИЛЬ", color = Cyan, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(myEmail, color = Muted, fontSize = 13.sp)
                    RevField(editName, { editName = it }, "Имя")
                    RevField(editUsername, { editUsername = it }, "Username")
                    RevButton("Сохранить профиль", loading, {
                        onSaveProfile(editName, editUsername)
                    })
                    Spacer(Modifier.height(12.dp))
                    RevButton("Выйти из аккаунта", false, onLogout, danger = true)
                }
            }
        }

        if (error.isNotBlank()) {
            Text(
                error,
                color = Color(0xFFFF7D9D),
                fontSize = 12.sp,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp)
            )
        }

        Row(
            Modifier.fillMaxWidth().background(Panel).navigationBarsPadding().padding(8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            NavItem("Чаты", "chats", tab, onTab)
            NavItem("Контакты", "contacts", tab, onTab)
            NavItem("Профиль", "profile", tab, onTab)
        }
    }
}

@Composable
private fun ChatScreen(
    chat: ChatItem,
    messages: List<MessageItem>,
    myId: Int,
    text: String,
    onText: (String) -> Unit,
    loading: Boolean,
    error: String,
    onBack: () -> Unit,
    onRefresh: () -> Unit,
    onSend: () -> Unit
) {
    Column(Modifier.fillMaxSize()) {
        Row(
            Modifier.fillMaxWidth().background(Panel).padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("‹", color = Purple, fontSize = 34.sp,
                modifier = Modifier.clickable { onBack() }.padding(horizontal = 8.dp))
            Column(Modifier.weight(1f)) {
                Text(chat.name, color = White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Text(
                    if (chat.username.isNotBlank()) "@${chat.username}" else "Чат RevOx",
                    color = Muted,
                    fontSize = 12.sp
                )
            }
            TextButton(onClick = onRefresh, enabled = !loading) {
                Text("↻", color = Cyan, fontSize = 22.sp)
            }
        }

        if (messages.isEmpty() && !loading) {
            EmptyState("Начало переписки", "Отправь первое сообщение")
        }

        LazyColumn(
            modifier = Modifier.weight(1f).fillMaxWidth(),
            contentPadding = PaddingValues(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(messages, key = { it.id }) { message ->
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = if (message.senderId == myId) {
                        Arrangement.End
                    } else {
                        Arrangement.Start
                    }
                ) {
                    Column(
                        Modifier.widthIn(max = 300.dp)
                            .background(
                                if (message.senderId == myId) Color(0xFF42246C) else Panel,
                                RoundedCornerShape(16.dp)
                            )
                            .padding(horizontal = 14.dp, vertical = 10.dp)
                    ) {
                        Text(message.text, color = White, fontSize = 15.sp)
                        if (message.createdAt.isNotBlank() && message.createdAt != "null") {
                            Text(message.createdAt, color = Muted, fontSize = 9.sp)
                        }
                    }
                }
            }
        }

        if (error.isNotBlank()) {
            Text(error, color = Color(0xFFFF7D9D), fontSize = 12.sp,
                modifier = Modifier.padding(horizontal = 12.dp))
        }

        Row(
            Modifier.fillMaxWidth().background(Panel).imePadding().padding(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = text,
                onValueChange = onText,
                modifier = Modifier.weight(1f),
                placeholder = { Text("Сообщение…", color = Muted) },
                shape = RoundedCornerShape(22.dp),
                colors = fieldColors(),
                maxLines = 4
            )
            Spacer(Modifier.width(8.dp))
            Button(
                onClick = onSend,
                enabled = !loading && text.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = Purple),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp)
            ) { Text("➤", fontSize = 18.sp) }
        }
    }
}

@Composable
private fun EmptyState(title: String, subtitle: String) {
    Column(
        Modifier.fillMaxWidth().padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("◈", color = Purple, fontSize = 40.sp)
        Text(title, color = White, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
        Text(subtitle, color = Muted, fontSize = 13.sp)
    }
}

@Composable
private fun Avatar(name: String) {
    Box(
        Modifier.size(48.dp).background(
            Color(0xFF34204F), RoundedCornerShape(16.dp)
        ),
        contentAlignment = Alignment.Center
    ) {
        Text(
            name.firstOrNull()?.uppercase() ?: "R",
            color = Cyan,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun NavItem(
    label: String,
    value: String,
    selected: String,
    onSelect: (String) -> Unit
) {
    Text(
        text = (if (selected == value) "●  " else "") + label,
        color = if (selected == value) Cyan else Muted,
        fontSize = 13.sp,
        modifier = Modifier.clickable { onSelect(value) }.padding(horizontal = 8.dp, vertical = 12.dp)
    )
}

@Composable
private fun RevField(
    value: String,
    onValue: (String) -> Unit,
    label: String,
    keyboard: KeyboardType = KeyboardType.Text,
    password: Boolean = false
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValue,
        modifier = Modifier.fillMaxWidth(),
        label = { Text(label, color = Muted) },
        singleLine = !password,
        shape = RoundedCornerShape(14.dp),
        keyboardOptions = KeyboardOptions(keyboardType = keyboard),
        visualTransformation = if (password) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
        colors = fieldColors()
    )
}

@Composable
private fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedTextColor = White,
    unfocusedTextColor = White,
    focusedBorderColor = Purple,
    unfocusedBorderColor = Color(0xFF413651),
    cursorColor = Cyan,
    focusedLabelColor = Purple,
    unfocusedLabelColor = Muted,
    focusedContainerColor = Panel,
    unfocusedContainerColor = Panel
)

@Composable
private fun RevButton(
    label: String,
    loading: Boolean,
    onClick: () -> Unit,
    danger: Boolean = false
) {
    Button(
        onClick = onClick,
        enabled = !loading,
        modifier = Modifier.fillMaxWidth().height(52.dp),
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (danger) Color(0xFF762843) else Purple,
            disabledContainerColor = Color(0xFF443553)
        )
    ) {
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                color = White,
                strokeWidth = 2.dp
            )
        } else {
            Text(label, color = White, fontWeight = FontWeight.SemiBold)
        }
    }
}
