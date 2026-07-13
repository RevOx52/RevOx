package com.revox.messenger.activities

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.revox.messenger.R

class LoginActivity : AppCompatActivity() {

    private lateinit var emailInput: EditText
    private lateinit var continueButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_login)

        emailInput = findViewById(R.id.emailInput)
        continueButton = findViewById(R.id.continueButton)

        continueButton.setOnClickListener {

            val email = emailInput.text.toString().trim()

            if (email.isEmpty()) {
                emailInput.error = "Введите email"
                return@setOnClickListener
            }

            Toast.makeText(
                this,
                "Email: $email",
                Toast.LENGTH_SHORT
            ).show()

        }
    }
}
