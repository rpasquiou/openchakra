package com.dekuple.tensiometre

import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class WithingsLink(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "WithingsLink"
    @ReactMethod fun openInstall() {
        startActivity(WithingsActivity.createInstallIntent(getApplicationContext()));
    }

    @ReactMethod fun sayHello() {
        Log.d("WithongsLink", "sayHello called");
        return "Hello"
    }

}