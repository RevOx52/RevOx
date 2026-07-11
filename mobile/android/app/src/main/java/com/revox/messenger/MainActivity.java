package com.revox.messenger;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.graphics.Typeface;
import android.view.Gravity;
import android.widget.*;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(40, 40, 40, 40);
        root.setBackgroundColor(Color.rgb(10,10,10));


        TextView logo = new TextView(this);
        logo.setText("🦆");
        logo.setTextSize(60);
        logo.setGravity(Gravity.CENTER);


        TextView title = new TextView(this);
        title.setText("RevOx");
        title.setTextSize(36);
        title.setTextColor(Color.WHITE);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        title.setGravity(Gravity.CENTER);


        EditText email = new EditText(this);
        email.setHint("Email");
        email.setTextColor(Color.WHITE);
        email.setHintTextColor(Color.GRAY);
        email.setInputType(33);


        Button button = new Button(this);
        button.setText("Continue");


        root.addView(logo);
        root.addView(title);

        root.addView(email,
            new LinearLayout.LayoutParams(
                -1,
                120
            )
        );

        root.addView(button);


        setContentView(root);
    }
}
