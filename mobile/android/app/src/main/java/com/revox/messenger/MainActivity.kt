package com.revox.messenger

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val RevOxBackground = Color(0xFF090B10)
private val RevOxSurface = Color(0xFF141821)
private val RevOxAccent = Color(0xFF7C6CFF)
private val RevOxText = Color(0xFFF5F5FA)
private val RevOxMuted = Color(0xFF969BAC)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = RevOxAccent,
                    background = RevOxBackground,
                    surface = RevOxSurface,
                    onPrimary = Color.White,
                    onBackground = RevOxText,
                    onSurface = RevOxText
                )
            ) {
                RevOxAuthScreen()
            }
        }
    }
}

@Composable
private fun RevOxAuthScreen() {
    var isLogin by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("") }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = RevOxBackground
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 32.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.Start
        ) {
            Box(
                modifier = Modifier
                    .background(
                        RevOxAccent.copy(alpha = 0.16f),
                        RoundedCornerShape(22.dp)
                    )
                    .padding(horizontal = 18.dp, vertical = 14.dp)
            ) {
                Text(
                    text = "R",
                    color = RevOxAccent,
                    fontSize = 34.sp,
                    fontWeight = FontWeight.Black
                )
            }

            Spacer(Modifier.height(26.dp))

            Text(
                text = "RevOx",
                fontSize = 38.sp,
                fontWeight = FontWeight.ExtraBold,
                color = RevOxText
            )

            Spacer(Modifier.height(8.dp))

            Text(
                text = if (isLogin) {
                    "Рады снова тебя видеть"
                } else {
                    "Создай свой аккаунт"
                },
                fontSize = 17.sp,
                color = RevOxMuted
            )

            Spacer(Modifier.height(28.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(RevOxSurface, RoundedCornerShape(16.dp))
                    .padding(5.dp)
            ) {
                ModeButton(
                    text = "Войти",
                    selected = isLogin,
                    modifier = Modifier.weight(1f)
                ) {
                    isLogin = true
                    status = ""
                }

                Spacer(Modifier.width(5.dp))

                ModeButton(
                    text = "Регистрация",
                    selected = !isLogin,
                    modifier = Modifier.weight(1f)
                ) {
                    isLogin = false
                    status = ""
                }
            }

            Spacer(Modifier.height(22.dp))

            if (!isLogin) {
                AuthField(
                    value = firstName,
                    onValueChange = { firstName = it },
                    label = "Имя"
                )

                Spacer(Modifier.height(12.dp))

                AuthField(
                    value = lastName,
                    onValueChange = { lastName = it },
                    label = "Фамилия"
                )

                Spacer(Modifier.height(12.dp))

                AuthField(
                    value = username,
                    onValueChange = {
                        username = it.lowercase().filter { ch ->
                            ch in 'a'..'z' || ch in '0'..'9' || ch == '_'
                        }
                    },
                    label = "Username"
                )

                Spacer(Modifier.height(12.dp))
            }

            AuthField(
                value = email,
                onValueChange = { email = it },
                label = "Электронная почта"
            )

            Spacer(Modifier.height(12.dp))

            AuthField(
                value = password,
                onValueChange = { password = it },
                label = "Пароль",
                password = true
            )

            Spacer(Modifier.height(22.dp))

            Button(
                onClick = {
                    status = when {
                        email.isBlank() ->
                            "Введи электронную почту"

                        isLogin && password.isBlank() ->
                            "Введи пароль"

                        !isLogin && firstName.isBlank() ->
                            "Введи имя"

                        !isLogin && lastName.isBlank() ->
                            "Введи фамилию"

                        !isLogin && username.length < 3 ->
                            "Username должен содержать минимум 3 символа"

                        !isLogin && !email.contains("@") ->
                            "Проверь электронную почту"

                        !isLogin && password.length < 6 ->
                            "Пароль должен содержать минимум 6 символов"

                        else ->
                            "Интерфейс готов. API подключим следующим этапом."
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = RevOxAccent
                )
            ) {
                Text(
                    text = if (isLogin) "Войти" else "Создать аккаунт",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            if (status.isNotBlank()) {
                Spacer(Modifier.height(16.dp))

                Text(
                    text = status,
                    color = RevOxMuted,
                    fontSize = 14.sp
                )
            }

            Spacer(Modifier.height(26.dp))

            Text(
                text = "Нативный интерфейс • Jetpack Compose",
                color = RevOxMuted,
                fontSize = 12.sp
            )
        }
    }
}

@Composable
private fun AuthField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    password: Boolean = false
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        label = { Text(label) },
        singleLine = true,
        shape = RoundedCornerShape(15.dp),
        visualTransformation = if (password) {
            PasswordVisualTransformation()
        } else {
            VisualTransformation.None
        }
    )
}

@Composable
private fun ModeButton(
    text: String,
    selected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (selected) {
                RevOxAccent
            } else {
                Color.Transparent
            },
            contentColor = RevOxText
        )
    ) {
        Text(text)
    }
}
