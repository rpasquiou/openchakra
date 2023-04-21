package com.dekuple.tensiometre

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log

class RNLinkModule(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "RNLinkModule"

    @ReactMethod fun isUserHasSubscribed(userId: String) {
        MainActivity.instance.isUserHasSubscribed(userId)
    }
}
