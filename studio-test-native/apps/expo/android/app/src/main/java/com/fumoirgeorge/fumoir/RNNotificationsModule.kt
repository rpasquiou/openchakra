package com.fumoirgeorge.fumoir

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log

class RNNotificationsModule(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "RNNotificationsModule"

    @ReactMethod fun subscribeToNotifications(userId: String) {
        NotificationsHandler.getInstance().subscribeToNotifications(userId)
    }

    @ReactMethod fun unsubscribeFromNotifications() {
        Log.d("DEKUPLE", "WithingsLink.askOwnPermissions")
        NotificationsHandler.getInstance().unsubscribeFromNotifications()
    }
}
