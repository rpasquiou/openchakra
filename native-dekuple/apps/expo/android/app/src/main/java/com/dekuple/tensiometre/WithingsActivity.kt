package com.dekuple.tensiometre

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Bundle
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.withings.library.webble.WithingsFragment
import android.util.Log

class WithingsActivity : AppCompatActivity() {

    companion object {
        fun createInstallIntent(context: Context, accessToken: String, csrfToken: String): Intent {
          try {
            val url = "https://inappviews.withings.com/sdk/setup?csrf_token=$csrfToken&device_model=45"
            return createIntent(context, url, accessToken)
            }
            catch(e: Throwable) {
              Log.d("DEKUPLE", "createInstallIntent $e")
              throw e
            }
        }

        fun createSettingsIntent(context: Context, accessToken: String, csrfToken: String): Intent {
          try {
            val url = "https://inappviews.withings.com/sdk/settings?csrf_token=$csrfToken"
            return createIntent(context, url, accessToken)
            }
            catch(e: Throwable) {
              Log.d("DEKUPLE", "createSettingsIntent $e")
              throw e
            }
        }

        private fun createIntent(context: Context, url: String, accessToken: String? = null): Intent {
            try {
              Log.d("DEKUPLE", "Opening with access token $accessToken")
              return Intent(context, WithingsActivity::class.java)
                  .putExtra(EXTRA_KEY_URL, url)
                  .putExtra(EXTRA_KEY_ACCESS_TOKEN, accessToken)
            }
            catch(e: Throwable) {
              Log.d("DEKUPLE", "createIntent $e")
              throw e
            }
        }

        private const val EXTRA_KEY_URL = "url"
        private const val EXTRA_KEY_ACCESS_TOKEN = "access_token"
    }

    private val url by lazy { intent.getStringExtra(EXTRA_KEY_URL)!! }
    private val accessToken by lazy { intent.getStringExtra(EXTRA_KEY_ACCESS_TOKEN) }
    private val fragment by lazy { WithingsFragment.newInstance(url, accessToken) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_withings)
        if (isOnline()) {
            showWithingsFragment()
        } else {
            showNoInternet()
        }
    }

    private fun isOnline(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val networkCapabilities = connectivityManager.activeNetwork?.let { connectivityManager.getNetworkCapabilities(it) }
            networkCapabilities?.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED) == true
        } else true
    }

    private fun showWithingsFragment() {
        supportFragmentManager.beginTransaction().replace(R.id.content, fragment).commitAllowingStateLoss()
        fragment.setCloseIntentListener { finish() }
        fragment.setNotificationListener { type, parameters -> onWithingsSdkNotification(type, parameters)}
    }

    private fun onWithingsSdkNotification(type: Int, parameters: Map<String, String>) {
        val withingsSdkNotification = WithingsSdkNotification.parse(type, parameters)
        if (withingsSdkNotification != null) {
            onWithingsSdkNotification(withingsSdkNotification)
        } else {
            val toastText = "type : $type\n" + parameters.entries.joinToString("\n") { "${it.key} : ${it.value}" }
            Toast.makeText(this, toastText, Toast.LENGTH_LONG).show()
        }
    }

    private fun onWithingsSdkNotification(withingsSdkNotification: WithingsSdkNotification) {
        if (withingsSdkNotification is WithingsSdkNotification.InstallationSuccess) {
            finish()
        }
        if (withingsSdkNotification is WithingsSdkNotification.InstallationSuccess
            || withingsSdkNotification is WithingsSdkNotification.InstallationFromSettingsSuccess) {
            Toast.makeText(this, "Installation Successful", Toast.LENGTH_LONG).show()
        } else {
            val toastText = withingsSdkNotification.javaClass.simpleName
            Toast.makeText(this, toastText, Toast.LENGTH_LONG).show()
        }
    }

    private fun showNoInternet() {
        AlertDialog.Builder(this)
            .setTitle(R.string.noInternet)
            .setPositiveButton(R.string.ok) { _, _ -> finish() }
            .setOnDismissListener { finish() }
            .create().show()
    }

    override fun onBackPressed() {
        if (fragment.canGoBack()) {
            fragment.goBack()
        } else {
            setResult(Activity.RESULT_CANCELED)
            finish()
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            android.R.id.home -> {
                setResult(Activity.RESULT_CANCELED)
                finish()
                return true
            }
        }
        return super.onOptionsItemSelected(item)
    }
}
