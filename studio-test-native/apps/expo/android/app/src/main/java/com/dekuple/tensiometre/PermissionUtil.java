package com.dekuple.tensiometre;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;
//import android.support.annotation.NonNull;
//import android.support.annotation.RequiresApi;
//import android.support.v4.app.ActivityCompat;
import androidx.core.app.ActivityCompat;
import android.Manifest;

import java.util.ArrayList;
import java.util.List;


public final class PermissionUtil {

  public static final int REQUEST_CODE_PERMISSIONS = 100;

  final static String[] PERMISSIONS={
    Manifest.permission.INTERNET,
    Manifest.permission.READ_EXTERNAL_STORAGE,
    Manifest.permission.SYSTEM_ALERT_WINDOW,
    Manifest.permission.WRITE_EXTERNAL_STORAGE,
    Manifest.permission.BLUETOOTH,
    Manifest.permission.BLUETOOTH_ADMIN,
    Manifest.permission.BLUETOOTH_SCAN,
    Manifest.permission.ACCESS_COARSE_LOCATION,
    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.ACCESS_BACKGROUND_LOCATION
  };

      /**
       * Check if multiple permissions are granted, if not request them.
       *
       * @param activity calling activity which needs permissions.
       * @param permissions one or more permissions, such as {@link android.Manifest.permission#CAMERA}.
       * @return true if all permissions are granted, false if at least one is not granted yet.
       */
      //@RequiresApi(api = Build.VERSION_CODES.M)
      public static boolean checkAndRequestPermissions(Activity activity, String... permissions) {

          List<String> permissionsList = new ArrayList<>();
          for (String permission : permissions) {
              int permissionState = activity.checkSelfPermission(permission);
              if (permissionState == PackageManager.PERMISSION_DENIED) {
                  permissionsList.add(permission);
              }
          }

          Log.d("DEKUPLE", String.join(",", permissionsList));
          if (!permissionsList.isEmpty()) {
              ActivityCompat.requestPermissions(activity,
                      permissionsList.toArray(new String[permissionsList.size()]),
                      REQUEST_CODE_PERMISSIONS);
              return false;
          }

          return true;
      }


      /**
       * Handle the result of permission request, should be called from the calling {@link Activity}'s
       * {@link ActivityCompat.OnRequestPermissionsResultCallback#onRequestPermissionsResult(int, String[], int[])}
       *
       * @param activity calling activity which needs permissions.
       * @param requestCode code used for requesting permission.
       * @param permissions permissions which were requested.
       * @param grantResults results of request.
       * @param callBack Callback interface to receive the result of permission request.
       */
      //public static void onRequestPermissionsResult(final Activity activity, int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults, final PermissionsCallBack callBack) {
      public static void onRequestPermissionsResult(final Activity activity, int requestCode, String[] permissions, int[] grantResults, final PermissionsCallBack callBack) {
          if (requestCode == PermissionUtil.REQUEST_CODE_PERMISSIONS && grantResults.length > 0) {

              final List<String> permissionsList = new ArrayList<>();
              for (int i = 0; i < permissions.length; i++) {
                  if (grantResults[i] == PackageManager.PERMISSION_DENIED) {
                      permissionsList.add(permissions[i]);
                  }
              }

              if (permissionsList.isEmpty() && callBack != null) {
                  callBack.permissionsGranted();
              } else {
                  boolean showRationale = false;
                  for (String permission : permissionsList) {
                      if (ActivityCompat.shouldShowRequestPermissionRationale(activity, permission)) {
                          //showRationale = true;
                          break;
                      }
                  }

                  if (showRationale) {
                      showAlertDialog(activity, new DialogInterface.OnClickListener() {
                          @TargetApi(Build.VERSION_CODES.M)
                          @Override
                          public void onClick(DialogInterface dialogInterface, int i) {
                              Log.d("DEKUPLE", "Click OK");
                              checkAndRequestPermissions(activity, permissionsList.toArray(new String[permissionsList.size()]));
                          }
                      }, new DialogInterface.OnClickListener() {
                          @Override
                          public void onClick(DialogInterface dialogInterface, int i) {
                              Log.d("DEKUPLE", "Click NOK");
                              if (callBack != null) {
                                  callBack.permissionsDenied();
                              }
                          }
                      });
                  }
              }
          }
      }

      /**
       * Show alert if any permission is denied and ask again for it.
       *
       * @param context
       * @param okListener
       * @param cancelListener
       */
      private static void showAlertDialog(Context context,
                                          DialogInterface.OnClickListener okListener,
                                          DialogInterface.OnClickListener cancelListener) {
          new AlertDialog.Builder(context)
                  .setMessage("Some permissions are not granted. Application may not work as expected. Do you want to grant them?")
                  .setPositiveButton("OK", okListener)
                  .setNegativeButton("Cancel", cancelListener)
                  .create()
                  .show();
      }

      public interface PermissionsCallBack {
          void permissionsGranted();

          void permissionsDenied();
      }

}
