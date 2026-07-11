package com.revox.messenger

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.*
import androidx.compose.runtime.Composable


class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {

            RevOxScreen()

        }
    }
}



@Composable
fun RevOxScreen(){

    Surface(

        modifier = androidx.compose.ui.Modifier
            .fillMaxSize()

    ){

        Text(

            text = "RevOx 🦆",

            style = MaterialTheme.typography.headlineLarge

        )

    }

}
