package com.dekuple.tensiometre;

import java.util.Arrays;
import java.util.stream.Stream;
import java.util.Map;
import java.util.Hashtable;
import java.util.concurrent.ThreadLocalRandom;

import android.Manifest;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.util.Log;
import androidx.appcompat.app.AlertDialog;
import android.widget.Toast;
import android.view.View;
//import android.app.AlertDialog;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import expo.modules.ReactActivityDelegateWrapper;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;
import com.dekuple.tensiometre.PermissionUtil;

public class MainActivity extends ReactActivity
  implements ActivityCompat.OnRequestPermissionsResultCallback {
  //implements PermissionUtil.PermissionsCallBack {

  public static interface Callback {
    void run();
  }

  public static MainActivity instance=null;
  private static final int NOTIFICATION_REQUEST_CODE = 12345;

  private Map<String, Callback> permissionsCallbacks=new Hashtable<String, Callback>();

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    Log.d("DEKUPLE", "MainActivity setting singleton instance");
    MainActivity.instance=this;
    setTheme(R.style.AppTheme);
    super.onCreate(null);

    requestNotifPermission();
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

  private void displayRationale(String permission, Callback callback) {
    if (permission.contains("LOCATION")) {
      AlertDialog.Builder alertBuilder = new AlertDialog.Builder(this);
      alertBuilder.setCancelable(true);
      alertBuilder.setTitle("Autorisation nécessaire");
      alertBuilder.setMessage(PermissionUtil.LOC_MESSAGE);
      alertBuilder.setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
        public void onClick(DialogInterface dialog, int which) {
          requestPermissions(new String[]{permission}, callback, false);
        }
      });

      AlertDialog alert = alertBuilder.create();
      alert.show();
    }
  }

  void checkPermissionsAndLaunch(String[] permissions, Callback callback) {
    String[] deniedPermissions=getDeniedPermissions(permissions);
    if (deniedPermissions.length>0) {
      requestPermissions(deniedPermissions, callback, true);
    }
    else {
      callback.run();
    }
  }

  public String[] getDeniedPermissions(String[] permissions) {
    String[] deniedPermissions=Arrays.stream(permissions)
     .filter(perm -> ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED)
     .toArray(String[]::new);
    Log.i("DEKUPLE", String.format("Denied permissions:%d:%s", deniedPermissions.length, String.join(",", deniedPermissions)));
    return deniedPermissions;
  }

  public void requestPermissions(String[] permissions, Callback callback, Boolean rationales) {
    for (String p: permissions) {
      boolean requiresRationale=ActivityCompat.shouldShowRequestPermissionRationale(this, p);
      Log.d("DEKUPLE", String.format("Permissions %s rationale required : %s", p, requiresRationale ? "true": "false"));
    }
    Log.d("DEKUPLE", String.format("ManiActivity.requestPermissions:%s", String.join(",", permissions)));
    String[] deniedPermissions=getDeniedPermissions(permissions);
    for (int i=0; i<deniedPermissions.length; i++) {
      String permission=deniedPermissions[i];
      int requestCode=ThreadLocalRandom.current().nextInt(1, 10000);
      if (callback!=null) {
        permissionsCallbacks.put(permission, callback);
      }
      boolean requiresRationale=ActivityCompat.shouldShowRequestPermissionRationale(this, permission);
      if (rationales && (requiresRationale || permission.contains("LOCATION"))) {
        displayRationale(permission, callback);
      }
      else {
        //Log.d("DEKUPLE", String.format("Permissions %s rationale required : %s", deniedPermissions[i], requiresRationale ? "true": "false"));
        ActivityCompat.requestPermissions(this, new String[]{permission}, requestCode);
      }
    }
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, /**@NonNull*/ String[] permissions, /**@NonNull*/ int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    Log.d("DEKUPLE", "MainActivity.onRequestPermissionsResult:" + String.join(",", permissions));
    for (int i = 0; i < grantResults.length; i++) {
      String permission = permissions[i];
      boolean granted = grantResults[i] == PackageManager.PERMISSION_GRANTED;
      Log.d("DEKUPLE", String.format("Granted %s:%s", permission, granted ? "true" : "false"));
      if (granted && permissionsCallbacks.containsKey(permission)) {
        permissionsCallbacks.remove(permissions[i]).run();
      }
    }
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


  /** handle notification with topics */

  public void isUserHasSubscribed(String userId) {

    SharedPreferences sharedPreferences = getSharedPreferences("my_preferences", MODE_PRIVATE);
    String hasId = sharedPreferences.getString("userid", "");
    if (hasId.isEmpty()) {
      /* Use of preferences to avoid subscribing topic multiple times */
      SharedPreferences.Editor editor = sharedPreferences.edit();
      editor.putString("userid", userId);
      editor.apply();

      subscribeToTopic("user", userId);
      Log.d("USERID", "has id " + sharedPreferences);
    }
  }

    public void requestNotifPermission() {

        if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED) {
            Log.i("NOTIF", "Permissions are granted. Good to go!");
            // L'autorisation est déjà accordée, faites ce que vous voulez ici
        } else {
            // L'autorisation n'est pas accordée
            Log.i("NOTIF", "Permissions not granted !");
            // Vérifiez si l'utilisateur a déjà refusé l'autorisation
            if (ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.this,
                    Manifest.permission.POST_NOTIFICATIONS)) {
                // L'utilisateur a déjà refusé l'autorisation, expliquez pourquoi vous en avez besoin
                Toast.makeText(MainActivity.this, "Nous avons besoin de votre autorisation pour afficher les notifications", Toast.LENGTH_LONG).show();
            } else {

                Log.i("NOTIF", "Old android, here we go !");
                // Demandez l'autorisation
                ActivityCompat.requestPermissions(MainActivity.this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS},
                        NOTIFICATION_REQUEST_CODE);
            }
        }
    }

  public void subscribeToTopic(String topic, String userId) {
    
    String definedTopic = topic + "_" + userId;

    FirebaseMessaging.getInstance().subscribeToTopic(definedTopic)
        .addOnCompleteListener(new OnCompleteListener<Void>() {
            @Override
            public void onComplete(@NonNull Task<Void> task) {
                String msg = "Notifications pour " + topic;
                if (!task.isSuccessful()) {
                    msg = "Enregistrement notification refusé";
                }
                Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show();
            }
        });
  }

  public void unsubscribeToTopic(String topic, String userId) {

    String definedTopic = topic + "_" + userId;
    Log.d("TOPIC", definedTopic);

    FirebaseMessaging.getInstance().unsubscribeFromTopic(definedTopic)
      .addOnCompleteListener(new OnCompleteListener<Void>() {
            @Override
            public void onComplete(@NonNull Task<Void> task) {
                String msg = "Notifications " + topic + "";
                if (!task.isSuccessful()) {
                    msg = "Enregistrement notification refusé";
                }
                Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show();
            }
        });
    }

}
