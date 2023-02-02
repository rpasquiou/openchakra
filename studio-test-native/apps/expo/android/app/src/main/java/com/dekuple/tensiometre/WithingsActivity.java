package com.dekuple.tensiometre;

import java.util.Map;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.os.Build;
import android.os.Bundle;
import android.view.MenuItem;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.withings.library.webble.WithingsFragment;

class WithingsSdkNotification {

  private final int value;

  private WithingsSdkNotification(int val){
    value=val;
  }

  private static final int INSTALLATION_SUCCESS=1;
  private static final int INSTALLATION_FAILURE=2;
  private static final int ACCOUNT_ERROR=3;
  private static final int INSTALLATION_FROM_SETTINGS_SUCCESS=4;
  private static final int INSTALLATION_FROM_SETTINGS_FAILURE=5;
  private static final int DEVICE_DISSOCIATION_SUCCESS=6;
  private static final int DEVICE_DISSOCIATION_FAILURE=7;
  private static final int UPDATE_WIFI_SETTINGS_SUCCESS=8;
  private static final int UPDATE_WIFI_SETTINGS_FAILURE=9;
  private static final int DEVICE_SYNCHRONISATION_SUCCESS=12;
  private static final int DEVICE_SYNCHRONISATION_FAILURE=13;
  private static final int LINK_OUT=16;
  private static final int SETTINGS_ERROR=17;

  public static final WithingsSdkNotification InstallationSuccess=new WithingsSdkNotification(INSTALLATION_SUCCESS);
  public static final WithingsSdkNotification InstallationFailure=new WithingsSdkNotification(INSTALLATION_FAILURE);
  public static final WithingsSdkNotification AccountError=new WithingsSdkNotification(ACCOUNT_ERROR);
  public static final WithingsSdkNotification InstallationFromSettingsSuccess=new WithingsSdkNotification(INSTALLATION_FROM_SETTINGS_SUCCESS);
  public static final WithingsSdkNotification InstallationFromSettingsFailure=new WithingsSdkNotification(INSTALLATION_FROM_SETTINGS_FAILURE);
  public static final WithingsSdkNotification DeviceDissociationSuccess=new WithingsSdkNotification(DEVICE_DISSOCIATION_SUCCESS);
  public static final WithingsSdkNotification DeviceDissociationFailure=new WithingsSdkNotification(DEVICE_DISSOCIATION_FAILURE);
  public static final WithingsSdkNotification UpdateWifiSettingssuccess=new WithingsSdkNotification(UPDATE_WIFI_SETTINGS_SUCCESS);
  public static final WithingsSdkNotification UpdateWifiSettingsfailure=new WithingsSdkNotification(UPDATE_WIFI_SETTINGS_FAILURE);
  public static final WithingsSdkNotification DeviceSynchronisationSuccess=new WithingsSdkNotification(DEVICE_SYNCHRONISATION_SUCCESS);
  public static final WithingsSdkNotification DeviceSynchronisationFailure=new WithingsSdkNotification(DEVICE_SYNCHRONISATION_FAILURE);
  public static final WithingsSdkNotification Linkout=new WithingsSdkNotification(LINK_OUT);
  public static final WithingsSdkNotification SettingsError=new WithingsSdkNotification(SETTINGS_ERROR);


  public static WithingsSdkNotification parse(int type, Map<String, String> parameters) {
    // TODO
    return null;
  }
}

public class WithingsActivity extends AppCompatActivity {

      private WithingsFragment _fragment=null;
      private static final String EXTRA_KEY_URL = "url";
      private static final String EXTRA_KEY_ACCESS_TOKEN = "access_token";


        public static Intent createInstallIntent(Context context) {
          final url = "https://your_redirection_url_for_install";
          return createIntent(context, url);
        }

        public static Intent createSettingsIntent(Context context, String accessToken) {
          final url = "https://your_redirection_url_for_settings";
          return createIntent(context, url, accessToken);
        }

        private static Intent createIntent(Context context, String accessToken) {
          final Intent intent=new Intent(context, WithingsActivity);
          intent.putExtra(EXTRA_KEY_URL, url);
          intent.putExtra(EXTRA_KEY_ACCESS_TOKEN, accessToken);
          return intent;
        }

        private String url() {
          return intent.getStringExtra(EXTRA_KEY_URL);
        }

        private String accessToken() {
          return intent.getStringExtra(EXTRA_KEY_ACCESS_TOKEN);
        }

        private WithingsFragment fragment() {
          if (_fragment==null) {
            _fragment=WithingsFragment.newInstance(url(), accessToken);
          }
          return _fragment;
        }

        @Override
        protected void onCreate(Bundle savedInstanceState) {
          super.onCreate(savedInstanceState);
          setContentView(R.layout.activity_withings);
          if (isOnline()) {
            showWithingsFragment();
          }
          else {
            showNoInternet();
          }
        }

        private Boolean isOnline() {
          return true;
          /*
          const connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
          return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val networkCapabilities = connectivityManager.activeNetwork?.let { connectivityManager.getNetworkCapabilities(it) }
            networkCapabilities?.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED) == true
          } else true
          */
          }

        private void showWithingsFragment() {
          // TODO supportFragmentManager.beginTransaction().replace(R.id.content, fragment).commitAllowingStateLoss();
          // TODO fragment.setCloseIntentListener { finish() };
          // TODO fragment.setNotificationListener { type, parameters -> onWithingsSdkNotification(type, parameters)};
        }

        private void onWithingsSdkNotification(int type, Map<String, String> parameters) {
          final WithingsSdkNotification withingsSdkNotification = WithingsSdkNotification.parse(type, parameters);
          if (withingsSdkNotification != null) {
            onWithingsSdkNotification(withingsSdkNotification);
          }
          else {
            //TODO const toastText = "type : $type\n" + parameters.entries.joinToString("\n") { "${it.key} : ${it.value}" }
            final String toastText = "Tagada"; //"type : $type\n" + parameters.entries.joinToString("\n") { "${it.key} : ${it.value}" }
            Toast.makeText(this, toastText, Toast.LENGTH_LONG).show();
          }
        }

        private void onWithingsSdkNotification(WithingsSdkNotification withingsSdkNotification) {
          if (withingsSdkNotification==WithingsSdkNotification.InstallationSuccess) {
            finish();
          }
          if (withingsSdkNotification==WithingsSdkNotification.InstallationSuccess
            || withingsSdkNotification==WithingsSdkNotification.InstallationFromSettingsSuccess) {
            Toast.makeText(this, "Installation Successful", Toast.LENGTH_LONG).show();
          }
          else {
            final String toastText = withingsSdkNotification.getClass().getSimpleName();
            Toast.makeText(this, toastText, Toast.LENGTH_LONG).show();
          }
        }

        private void showNoInternet() {
          // TODO
          /**
          AlertDialog.Builder(this)
            .setTitle(R.string.noInternet)
            .setPositiveButton(R.string.ok) { _, _ -> finish() }
            .setOnDismissListener { finish() }
            .create().show();
          */
        }

        @Override
        public void onBackPressed() {
          if (fragment().canGoBack()) {
            fragment().goBack();
          }
          else {
            setResult(Activity.RESULT_CANCELED);
            finish();
          }
        }

        /**
        @Override
        public boolean  onOptionsItemSelected(item: MenuItem): Boolean {
          when (item.itemId) {
            android.R.id.home -> {
              setResult(Activity.RESULT_CANCELED)
              finish()
              return true
            }
          }
          return super.onOptionsItemSelected(item)
          }
        */
}
