package com.revox.messenger.adapters


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.revox.messenger.R
import com.revox.messenger.models.Message


class MessageAdapter(
    private val messages:List<Message>
):
RecyclerView.Adapter<MessageAdapter.ViewHolder>(){


class ViewHolder(view:View):
RecyclerView.ViewHolder(view){

val text:TextView =
view.findViewById(R.id.messageText)

}


override fun onCreateViewHolder(
parent:ViewGroup,
viewType:Int
):ViewHolder{


val view =
LayoutInflater.from(parent.context)
.inflate(
R.layout.item_message,
parent,
false
)


return ViewHolder(view)

}


override fun onBindViewHolder(
holder:ViewHolder,
position:Int
){


holder.text.text =
messages[position].text


}


override fun getItemCount():Int =
messages.size


}
