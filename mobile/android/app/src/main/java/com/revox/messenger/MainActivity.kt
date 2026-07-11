package com.revox.messenger

import android.app.Activity
import android.os.Bundle
import android.widget.TextView
import android.graphics.Color
import android.view.Gravity

class MainActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val text = TextView(this)

        text.text = "RevOx\n\nNative Android"
        text.textSize = 30f
        text.setTextColor(Color.WHITE)
        text.setBackgroundColor(Color.BLACK)
        text.gravity = Gravity.CENTER

        setContentView(text)
    }
}
