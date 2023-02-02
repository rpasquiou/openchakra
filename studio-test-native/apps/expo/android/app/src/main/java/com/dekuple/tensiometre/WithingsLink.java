package com.dekuple.tensiometre;

import android.os.Bundle;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

class WithingsLink extends ReactContextBaseJavaModule {

    public WithingsLink(ReactApplicationContext reactContext) {
        super(reactContext);
    }
    @Override
    public String getName(){
        return "WithingsLink";
    }

    /**
    @ReactMethod
    public void openInstall() {
        startActivity(WithingsActivity.createInstallIntent(getCurrentActivity()));
    }
    */

    @ReactMethod
    public String sayHello() {
        //Log.d("WithongsLink", "sayHello called");
        return "Hello";
    }

}