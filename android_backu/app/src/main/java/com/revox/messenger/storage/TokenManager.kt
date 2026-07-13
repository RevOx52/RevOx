package com.revox.messenger.storage


import android.content.Context


class TokenManager(
    context: Context
) {


    private val prefs =
        context.getSharedPreferences(
            "revox",
            Context.MODE_PRIVATE
        )


    fun saveToken(token:String){

        prefs.edit()
            .putString(
                "token",
                token
            )
            .apply()

    }


    fun getToken():String?{

        return prefs.getString(
            "token",
            null
        )

    }

}
