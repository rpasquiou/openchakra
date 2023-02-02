package com.dekuple.tensiometre;

import android.os.Bundle;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import android.util.Log;

class WithingsLink extends ReactContextBaseJavaModule {

    public WithingsLink(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName(){
        return "WithingsLink";
    }

    @ReactMethod
    public void openInstall() {
        getCurrentActivity().startActivity(WithingsActivity.createInstallIntent(getCurrentActivity()));
    }

    @ReactMethod
    public void sayHello(Promise promise) {
        Log.e("WithingsLink", "sayHello called");
        promise.resolve("Tagada");
    }

}
