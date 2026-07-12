package com.revox.messenger.network

import com.revox.messenger.models.Message
import com.revox.messenger.models.Chat
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path


// ---------- AUTH ----------

data class LoginRequest(
    val email: String,
    val password: String
)


data class LoginResponse(
    val success: Boolean,
    val token: String?,
    val user: UserData?
)


data class UserData(
    val id: Int,
    val email: String,
    val firstName: String,
    val lastName: String
)


// ---------- CHATS ----------

data class ChatsResponse(
    val success: Boolean,
    val chats: List<Chat>
)


// ---------- MESSAGES ----------

data class MessagesResponse(
    val success: Boolean,
    val messages: List<Message>
)


data class SendMessageRequest(
    val chatId: Int,
    val text: String
)


data class SendMessageResponse(
    val success: Boolean,
    val message: String
)


// ---------- API ----------

interface ApiService {


    // Вход
    @POST("api/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>



    // Получить чаты
    @GET("api/chats")
    suspend fun getChats(
        @Header("Authorization")
        token: String
    ): Response<ChatsResponse>



    // Получить сообщения чата
    @GET("api/messages/{id}")
    suspend fun getMessages(
        @Path("id")
        chatId: Int,

        @Header("Authorization")
        token: String

    ): Response<MessagesResponse>



    // Отправить сообщение
    @POST("api/messages/send")
    suspend fun sendMessage(

        @Header("Authorization")
        token: String,

        @Body
        body: SendMessageRequest

    ): Response<SendMessageResponse>


}
