package com.revox.messenger.activities

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.revox.messenger.R

class SplashActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_splash)


        Thread {

            Thread.sleep(1500)


            val intent = Intent(
                this,
                LoginActivity::class.java
            )


            startActivity(intent)

            finish()


        }.start()

    }
}
