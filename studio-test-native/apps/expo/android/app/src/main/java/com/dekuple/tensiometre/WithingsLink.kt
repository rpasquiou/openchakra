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
import com.withings.library.webble.background.WithingsDeviceIdentity
import com.withings.library.webble.background.WithingsSyncService

class WithingsLink(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "WithingsLink"

    @ReactMethod fun openInstall(accessToken: String, csrfToken: String) {
        try {
          if (getReactApplicationContextIfActiveOrWarn()!=null) {
            val context=getReactApplicationContextIfActiveOrWarn()!!
            val intent=WithingsActivity.createInstallIntent(context, accessToken, csrfToken);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
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
          intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
          context.startActivity(intent);
        }
    }

    @ReactMethod fun synchronizeDevice(mac_address: String, advertise_key: String) {
        Log.e("DEKUPLE", "Trying to launch synchronization on $mac_address")
        if (getReactApplicationContextIfActiveOrWarn()!=null) {
          val deviceIdentity = WithingsDeviceIdentity(
            id = mac_address,
            advertisingKey = advertise_key
          )
          // Know that if you start without (background) location permission, the service will never synchronize your devices
          val syncService = WithingsSyncService.get(getReactApplicationContextIfActiveOrWarn()!!)
          syncService.start(listOf(deviceIdentity))
          syncService.setListener(WithingsSyncListener())
          Log.e("DEKUPLE", "Context found, launching synchronization on $mac_address")
        }
    }

}
