package com.revox.messenger

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            RevOxApp()
        }
    }
}

@Composable
fun RevOxApp() {

    MaterialTheme {

        Surface(
            modifier = Modifier.fillMaxSize()
        ) {

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),

                horizontalAlignment = Alignment.CenterHorizontally,

                verticalArrangement = Arrangement.Center
            ) {

                Text(
                    text = "🦆",
                    fontSize = 64.sp
                )

                Spacer(
                    modifier = Modifier.height(20.dp)
                )

                Text(
                    text = "RevOx",
                    fontSize = 40.sp
                )

                Spacer(
                    modifier = Modifier.height(40.dp)
                )

                OutlinedTextField(
                    value = "",
                    onValueChange = {},
                    label = {
                        Text("Email")
                    }
                )

                Spacer(
                    modifier = Modifier.height(20.dp)
                )

                Button(
                    onClick = {}
                ) {
                    Text("Continue")
                }
            }
        }
    }
}
