package com.revox.messenger;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        TextView text = new TextView(this);
        text.setText("RevOx\n\nДобро пожаловать");
        text.setTextSize(30);
        text.setGravity(17);

        setContentView(text);
    }
}
