package com.revox.messenger

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

private const val API_URL = "https://revox-yuyn.onrender.com/"

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                RevOxApp()
            }
        }
    }
}

private data class ApiResult(
    val ok: Boolean,
    val data: JSONObject?,
    val error: String = ""
)

private suspend fun apiRequest(
    path: String,
    body: JSONObject,
    token: String? = null
): ApiResult = withContext(Dispatchers.IO) {
    var connection: HttpURLConnection? = null

    try {
        connection = (URL(API_URL + path).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 15000
            readTimeout = 25000
            doOutput = true
            setRequestProperty("Content-Type", "application/json; charset=utf-8")
            setRequestProperty("Accept", "application/json")
            if (!token.isNullOrBlank()) {
                setRequestProperty("Authorization", "Bearer $token")
            }
        }

        connection.outputStream.use {
            it.write(body.toString().toByteArray(Charsets.UTF_8))
        }

        val status = connection.responseCode
        val stream = if (status in 200..299) {
            connection.inputStream
        } else {
            connection.errorStream
        }

        val raw = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
        val json = try {
            JSONObject(raw)
        } catch (_: Exception) {
            JSONObject()
        }

        if (status in 200..299) {
            ApiResult(
                ok = json.optBoolean("success", true),
                data = json,
                error = if (json.optBoolean("success", true)) "" else
                    describeError(status, json)
            )
        } else {
            ApiResult(false, json, describeError(status, json))
        }
    } catch (_: java.net.SocketTimeoutException) {
        ApiResult(false, null, "NETWORK_TIMEOUT · Сервер не ответил вовремя")
    } catch (_: java.net.UnknownHostException) {
        ApiResult(false, null, "NETWORK_UNAVAILABLE · Нет соединения с сервером")
    } catch (_: Exception) {
        ApiResult(false, null, "NETWORK_ERROR · Не удалось подключиться к серверу")
    } finally {
        connection?.disconnect()
    }
}

private fun describeError(status: Int, json: JSONObject): String {
    val code = json.optString("code")
        .ifBlank { json.optString("errorCode") }
    val name = json.optString("name")
        .ifBlank { json.optString("error") }

    val readable = when (status) {
        400 -> "Неверные данные"
        401 -> "Неверный пароль или требуется авторизация"
        403 -> "Доступ запрещён"
        404 -> "Пользователь или маршрут не найден"
        409 -> "Аккаунт уже существует"
        429 -> "Слишком много запросов"
        in 500..599 -> "Ошибка сервера"
        else -> "Запрос не выполнен"
    }

    val details = listOf(code, name)
        .filter { it.isNotBlank() && it != "undefined" }
        .distinct()
        .joinToString(" · ")

    return "HTTP $status · $readable" +
        if (details.isNotBlank()) "\n$details" else ""
}

private enum class Screen {
    AUTH, CODE, PROFILE, HOME
}

@Composable
private fun RevOxApp() {
    var screen by remember { mutableStateOf(Screen.AUTH) }
    var loginMode by remember { mutableStateOf(false) }

    var email by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }

    var token by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    fun runRequest(
        path: String,
        data: JSONObject,
        onSuccess: (JSONObject) -> Unit
    ) {
        if (busy) return

        scope.launch {
            busy = true
            status = "Подключаемся к RevOx…"

            try {
                val result = apiRequest(path, data)
                if (result.ok && result.data != null) {
                    status = ""
                    onSuccess(result.data)
                } else {
                    status = result.error.ifBlank {
                        "HTTP ? · UNKNOWN_ERROR · Запрос не выполнен"
                    }
                }
            } finally {
                busy = false
            }
        }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("RevOx", style = MaterialTheme.typography.displayMedium)
            Spacer(Modifier.height(8.dp))

            Text(
                when (screen) {
                    Screen.AUTH -> if (loginMode) "Вход в аккаунт" else "Создать аккаунт"
                    Screen.CODE -> "Подтверждение почты"
                    Screen.PROFILE -> "Настройка аккаунта"
                    Screen.HOME -> "Ты в RevOx!"
                },
                style = MaterialTheme.typography.titleLarge
            )

            Spacer(Modifier.height(24.dp))

            when (screen) {
                Screen.AUTH -> {
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it.trim() },
                        label = { Text("Электронная почта") },
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Email
                        ),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !busy
                    )

                    Spacer(Modifier.height(12.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Пароль") },
                        visualTransformation = PasswordVisualTransformation(),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !busy
                    )

                    if (!loginMode) {
                        Spacer(Modifier.height(12.dp))
                        Text(
                            "После отправки кода продолжишь регистрацию.",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    Spacer(Modifier.height(20.dp))

                    Button(
                        onClick = {
                            if (email.isBlank() || !email.contains("@")) {
                                status = "INVALID_EMAIL · Введи корректную почту"
                            } else if (loginMode && password.isBlank()) {
                                status = "PASSWORD_REQUIRED · Введи пароль"
                            } else if (loginMode) {
                                runRequest(
                                    "api/auth/login",
                                    JSONObject()
                                        .put("email", email)
                                        .put("password", password)
                                ) { response ->
                                    token = response.optString("token")
                                    if (token.isNotBlank()) {
                                        screen = Screen.HOME
                                    } else {
                                        status = "TOKEN_MISSING · Сервер не вернул токен"
                                    }
                                }
                            } else {
                                runRequest(
                                    "api/auth/register",
                                    JSONObject().put("email", email)
                                ) {
                                    code = ""
                                    screen = Screen.CODE
                                    status = "Код отправлен на $email"
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !busy
                    ) {
                        Text(
                            if (busy) "Подождите…"
                            else if (loginMode) "Войти" else "Отправить код"
                        )
                    }

                    TextButton(
                        onClick = {
                            loginMode = !loginMode
                            status = ""
                        },
                        enabled = !busy
                    ) {
                        Text(
                            if (loginMode) "Создать аккаунт" else "У меня уже есть аккаунт"
                        )
                    }
                }

                Screen.CODE -> {
                    Text(
                        "Введи код из письма. Он подтверждает адрес электронной почты."
                    )

                    Spacer(Modifier.height(16.dp))

                    OutlinedTextField(
                        value = code,
                        onValueChange = { code = it.filter(Char::isDigit).take(6) },
                        label = { Text("Код из письма") },
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Number
                        ),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !busy
                    )

                    Spacer(Modifier.height(16.dp))

                    Button(
                        onClick = {
                            if (code.length != 6) {
                                status = "INVALID_CODE · Введи шестизначный код"
                            } else {
                                runRequest(
                                    "api/auth/verify",
                                    JSONObject()
                                        .put("email", email)
                                        .put("code", code)
                                ) {
                                    screen = Screen.PROFILE
                                    status = "Почта подтверждена"
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !busy
                    ) {
                        Text("Подтвердить код")
                    }

                    TextButton(
                        onClick = {
                            screen = Screen.AUTH
                            status = ""
                        },
                        enabled = !busy
                    ) {
                        Text("Назад")
                    }
                }

                Screen.PROFILE -> {
                    OutlinedTextField(
                        value = firstName,
                        onValueChange = { firstName = it },
                        label = { Text("Имя") },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !busy
                    )

                    Spacer(Modifier.height(10.dp))

                    OutlinedTextField(
                        value = lastName,
                        onValueChange = { lastName = it },
                        label = { Text("Фамилия") },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !busy
                    )

                    Spacer(Modifier.height(10.dp))

                    OutlinedTextField(
                        value = username,
                        onValueChange = { username = it },
                        label = { Text("Имя пользователя") },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !busy
                    )

                    Spacer(Modifier.height(10.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Придумай пароль") },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !busy
                    )

                    Spacer(Modifier.height(20.dp))

                    Button(
                        onClick = {
                            if (
                                firstName.isBlank() || lastName.isBlank() ||
                                username.isBlank() || password.length < 8
                            ) {
                                status = "INVALID_PROFILE · Заполни все поля; пароль — от 8 символов"
                            } else {
                                runRequest(
                                    "api/auth/set-password",
                                    JSONObject()
                                        .put("email", email)
                                        .put("password", password)
                                        .put("firstName", firstName)
                                        .put("lastName", lastName)
                                        .put("username", username)
                                ) { response ->
                                    token = response.optString("token")
                                    if (token.isNotBlank()) {
                                        screen = Screen.HOME
                                    } else {
                                        status = "TOKEN_MISSING · Сервер не вернул токен"
                                    }
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !busy
                    ) {
                        Text("Создать аккаунт")
                    }
                }

                Screen.HOME -> {
                    Text("Ты вошёл в RevOx.")
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "Сессия получена от сервера.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(Modifier.height(20.dp))
                    OutlinedButton(
                        onClick = {
                            token = ""
                            password = ""
                            screen = Screen.AUTH
                            loginMode = true
                            status = ""
                        }
                    ) {
                        Text("Выйти")
                    }
                }
            }

            if (busy) {
                Spacer(Modifier.height(20.dp))
                CircularProgressIndicator()
            }

            if (status.isNotBlank()) {
                Spacer(Modifier.height(16.dp))
                Text(
                    text = status,
                    color = if (
                        status.contains("HTTP ") ||
                        status.contains("ERROR") ||
                        status.contains("INVALID") ||
                        status.contains("REQUIRED")
                    ) MaterialTheme.colorScheme.error
                    else MaterialTheme.colorScheme.primary,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}
