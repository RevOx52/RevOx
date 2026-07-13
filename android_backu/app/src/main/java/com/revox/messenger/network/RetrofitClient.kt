package com.revox.messenger.network


import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory


object RetrofitClient {


    private const val BASE_URL =
        "http://192.168.66.38:8080/"


    val api: ApiService by lazy {

        Retrofit.Builder()

            .baseUrl(BASE_URL)

            .addConverterFactory(
                GsonConverterFactory.create()
            )

            .build()

            .create(ApiService::class.java)

    }

}
