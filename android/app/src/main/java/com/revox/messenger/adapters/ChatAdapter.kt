package com.revox.messenger.adapters


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.revox.messenger.R
import com.revox.messenger.models.Chat


class ChatAdapter(
    private val chats:List<Chat>
):
RecyclerView.Adapter<ChatAdapter.ViewHolder>() {



class ViewHolder(view:View):
RecyclerView.ViewHolder(view){

val title:TextView =
view.findViewById(R.id.chatTitle)

}



override fun onCreateViewHolder(
parent:ViewGroup,
viewType:Int
):ViewHolder{


val view =
LayoutInflater.from(parent.context)
.inflate(
R.layout.item_chat,
parent,
false
)


return ViewHolder(view)


}



override fun onBindViewHolder(
holder:ViewHolder,
position:Int
){


holder.title.text =
"Chat #${chats[position].id}"


}



override fun getItemCount():Int =
chats.size


}
