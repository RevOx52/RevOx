package com.revox.messenger.activities


import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.widget.*
import com.revox.messenger.R
import com.revox.messenger.adapters.MessageAdapter
import com.revox.messenger.network.*
import com.revox.messenger.storage.TokenManager
import kotlinx.coroutines.launch



class ChatActivity:AppCompatActivity(){


private var chatId:Int = 1



override fun onCreate(
savedInstanceState:Bundle?
){

super.onCreate(savedInstanceState)

setContentView(
R.layout.activity_chat
)



chatId =
intent.getIntExtra(
"chatId",
1
)



val list =
findViewById<RecyclerView>(
R.id.messages
)


val input =
findViewById<EditText>(
R.id.messageInput
)


val send =
findViewById<Button>(
R.id.sendButton
)


list.layoutManager =
LinearLayoutManager(this)



fun loadMessages(){


lifecycleScope.launch{


val token =
TokenManager(this@ChatActivity)
.getToken()


if(token!=null){


val result =
RetrofitClient.api.getMessages(
chatId,
"Bearer $token"
)


if(result.isSuccessful){

list.adapter =
MessageAdapter(
result.body()!!.messages
)

}



}



}



}



loadMessages()



send.setOnClickListener{


val text =
input.text.toString()


if(text.isNotEmpty()){


lifecycleScope.launch{


val token =
TokenManager(this@ChatActivity)
.getToken()



if(token!=null){


RetrofitClient.api.sendMessage(

"Bearer $token",

SendMessageRequest(
chatId,
text
)

)


input.text.clear()

loadMessages()


}


}



}



}



}

}
