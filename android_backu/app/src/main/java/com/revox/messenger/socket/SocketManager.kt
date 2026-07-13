package com.revox.messenger.socket


import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException



object SocketManager {


    private var socket: Socket? = null



    private const val SERVER_URL =
        "http://192.168.66.38:8080"



    fun connect(
        token:String? = null
    ) {


        if(socket?.connected() == true){
            return
        }


        try {


            val options =
                IO.Options()


            options.reconnection = true

            options.forceNew = true


            if(token != null){

                options.query =
                    "token=$token"

            }



            socket =
                IO.socket(
                    SERVER_URL,
                    options
                )



            socket?.connect()



        } catch(e:URISyntaxException){


            e.printStackTrace()


        }


    }



    fun disconnect(){


        socket?.disconnect()

        socket = null


    }



    fun emit(
        event:String,
        data:Any
    ){

        socket?.emit(
            event,
            data
        )

    }



    fun on(
        event:String,
        listener: (Array<Any>) -> Unit
    ){


        socket?.on(
            event
        ){ args ->


            listener(args)


        }


    }



    fun getSocket():Socket?{


        return socket


    }



    fun isConnected():Boolean{


        return socket?.connected() ?: false


    }


}
