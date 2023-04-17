package com.fumoirgeorge.fumoir;

/**
import java.util.Arrays;
import java.util.stream.Stream;
*/

import android.Manifest;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
//import androidx.core.app.ActivityCompat;
//import androidx.core.content.ContextCompat;
//import android.content.pm.PackageManager;
//import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import expo.modules.ReactActivityDelegateWrapper;

import com.fumoirgeorge.fumoir.Permissions;

public class MainActivity extends ReactActivity {

  public static MainActivity instance=null;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    MainActivity.instance=this;
    super.onCreate(null);

    /** TODO : when should permissions be asked for ?
    Stream<String> deniedPermissions=Arrays.stream(Permissions.PERMISSIONS)
      .filter(perm -> ContextCompat.checkSelfPermission(this, perm) == PackageManager.PERMISSION_DENIED);
    if (deniedPermissions.count()>0) {
      Log.d("FUMOIR", "Locations denied, requesting");
       // Requesting the permission
       ActivityCompat.requestPermissions(this, deniedPermissions.toArray(String[]::new), 100);
    }
    */
  }

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "main";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
      new MainActivityDelegate(this, getMainComponentName())
    );
  }

  /**
   * Align the back button behavior with Android S
   * where moving root activities to background instead of finishing activities.
   * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
   */
  @Override
  public void invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        // For non-root activities, use the default implementation to finish them.
        super.invokeDefaultOnBackPressed();
      }
      return;
    }

    // Use the default back button implementation on Android S
    // because it's doing more than {@link Activity#moveTaskToBack} in fact.
    super.invokeDefaultOnBackPressed();
  }

  public void setCurrentUser(String userId) {

    SharedPreferences sharedPreferences = getSharedPreferences("my_preferences", MODE_PRIVATE);
    String hasId = sharedPreferences.getString("userid", "");
    if (hasId.isEmpty()) {
      SharedPreferences.Editor editor = sharedPreferences.edit();
      editor.putString("userid", userId);
      editor.apply();
      /* Go write */
      Log.i("USERID", "has id " + sharedPreferences);
    }

    Log.i("USERID", hasId);
    Log.i("USERID", userId);
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }

    @Override
    protected boolean isConcurrentRootEnabled() {
      // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
      // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
      return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    }
  }
}
