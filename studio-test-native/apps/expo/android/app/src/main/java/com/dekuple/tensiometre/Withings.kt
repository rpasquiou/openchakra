package com.dekuple.tensiometre

import android.os.Build
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView
import expo.modules.ReactActivityDelegateWrapper
import com.withings.library.webble.WithingsFragment

class WithingsLink {
    fun openSettings() {
        WithingsFragment.newInstance("https://inappviews.withings.com/sdk/setup")
    }
}