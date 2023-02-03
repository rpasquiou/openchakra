package com.dekuple.tensiometre

import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.content.Intent
import android.util.Log

class WithingsLink(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "WithingsLink"

    @ReactMethod fun openInstall(accessToken: String, csrfToken: String) {
        try {
          if (getReactApplicationContextIfActiveOrWarn()!=null) {
            val context=getReactApplicationContextIfActiveOrWarn()!!
            val intent=WithingsActivity.createInstallIntent(context, accessToken, csrfToken);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK);
            context.startActivity(intent);
          }
        }
        catch(e: Throwable) {
          Log.e("DEKUPLE", "openInstall error: $e")
          throw e
        }
    }

    @ReactMethod fun openSettings(accessToken: String, csrfToken: String) {
        if (getReactApplicationContextIfActiveOrWarn()!=null) {
          val context=getReactApplicationContextIfActiveOrWarn()!!
          val intent=WithingsActivity.createSettingsIntent(context, accessToken, csrfToken)
          intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK);
          context.startActivity(intent);
        }
    }

    @ReactMethod fun sayHello(promise:Promise) {
        Log.d("DEKUPLE", "sayHello called");
        return promise.resolve("Bonjour")
    }

}
