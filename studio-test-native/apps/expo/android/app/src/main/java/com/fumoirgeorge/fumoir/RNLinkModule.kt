package com.fumoirgeorge.fumoir

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log

class RNLinkModule(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "CommunicateModule"
    private val idea: String = "COMMUNI"

    @ReactMethod fun setCurrentUser(userId: String) {
        Log.d(idea, "WithingsLink.askOwnPermissions")
        MainActivity.instance.setCurrentUser(userId)
    }
    /**
    @ReactMethod fun subscribeToTopic(topic: String, userId: String) {
        Log.d("DEKUPLE", "WithingsLink.askOwnPermissions")
        MainActivity.instance.subscribeToTopic(topic, userId)
    }

    @ReactMethod fun unsubscribeToTopic(topic: String, userId: String) {
        Log.d("DEKUPLE", "WithingsLink.askOwnPermissions")
        MainActivity.instance.unsubscribeToTopic(topic, userId)
    }

    @ReactMethod fun displayAlert() {
        Log.d("NOTIF", "WithingsLink.askAllPermissions")
        MainActivity.instance.displayRationale()
    }

    @ReactMethod fun askPermission() {
        Log.d("NOTIF", "WithingsLink.askPermission")
        MainActivity.instance.requestPermission()
    }

    @ReactMethod fun askToken() {
        Log.d("NOTIF", "Wouhou Token")
        MainActivity.instance.logRegToken()
    }
    */
}
