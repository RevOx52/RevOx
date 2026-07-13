package com.revox.messenger.activities


import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.revox.messenger.R
import com.revox.messenger.adapters.ChatAdapter
import com.revox.messenger.network.RetrofitClient
import com.revox.messenger.storage.TokenManager
import kotlinx.coroutines.launch



class HomeActivity:AppCompatActivity(){


override fun onCreate(
savedInstanceState:Bundle?
){

super.onCreate(savedInstanceState)

setContentView(
R.layout.activity_home
)


val list =
findViewById<RecyclerView>(
R.id.chatList
)


list.layoutManager =
LinearLayoutManager(this)



lifecycleScope.launch{


val token =
TokenManager(this@HomeActivity)
.getToken()



if(token!=null){


val response =
RetrofitClient.api.getChats(
"Bearer $token"
)



if(response.isSuccessful){


list.adapter =
ChatAdapter(
response.body()!!.chats
)


}



}



}



}


}
