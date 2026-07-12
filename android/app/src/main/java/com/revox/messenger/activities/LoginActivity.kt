package com.revox.messenger.activities


import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.revox.messenger.R
import com.revox.messenger.network.*
import com.revox.messenger.storage.TokenManager
import kotlinx.coroutines.launch



class LoginActivity : AppCompatActivity() {


    override fun onCreate(
        savedInstanceState: Bundle?
    ) {

        super.onCreate(savedInstanceState)

        setContentView(
            R.layout.activity_login
        )


        val email =
            findViewById<EditText>(
                R.id.email
            )


        val password =
            findViewById<EditText>(
                R.id.password
            )


        val button =
            findViewById<Button>(
                R.id.loginButton
            )


        val error =
            findViewById<TextView>(
                R.id.error
            )


        button.setOnClickListener {


            lifecycleScope.launch {


                try {


                    val response =
                        RetrofitClient.api.login(
                            LoginRequest(
                                email.text.toString(),
                                password.text.toString()
                            )
                        )


                    if(
                        response.isSuccessful &&
                        response.body()?.success == true
                    ) {


                        val token =
                            response.body()?.token


                        if(token != null) {


                            TokenManager(
                                this@LoginActivity
                            )
                            .saveToken(token)


                            startActivity(
                                Intent(
                                    this@LoginActivity,
                                    HomeActivity::class.java
                                )
                            )


                            finish()

                        }


                    } else {


                        error.text =
                            "Неверный логин или пароль"


                    }


                } catch(e:Exception) {


                    error.text =
                        "Ошибка сервера"


                }


            }


        }


    }

}
