package com.dekuple.tensiometre

import android.util.Log
import com.withings.library.webble.background.WithingsSyncService

class WithingsSyncListener : WithingsSyncService.Listener {

    // id is the id of your WithingsDeviceIdentity being synchronize and name is the advertising name of the product if available
    override fun onSynchronizationStarted(id: String, name: String?) {
        Log.d(this::class.simpleName, "onSynchronizationStarted: id: $id, name: $name")
    }

    override fun onSynchronizationSuccess(id: String, name: String?) {
        Log.d(this::class.simpleName, "onSynchronizationSuccess: id: $id, name: $name")
    }

    override fun onSynchronizationFailed(id: String, name: String?) {
        Log.d(this::class.simpleName, "onSynchronizationFailed: id: $id, name: $name")
    }
}