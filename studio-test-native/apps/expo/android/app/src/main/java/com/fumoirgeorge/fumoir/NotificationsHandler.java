package com.fumoirgeorge.fumoir;

import java.util.List;
import java.util.ArrayList;

import android.util.Log;
import androidx.annotation.NonNull;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

public class NotificationsHandler {

  private static NotificationsHandler instance=null;

  public static NotificationsHandler getInstance() {
    if (instance==null) {
      instance = new NotificationsHandler();
    }
    return instance;
  }

  private static final String TOPIC_PREFIX="user";
  private static final String ALL_TOPIC="ALL";

  private List<String> registeredTopics=new ArrayList<String>();

  public void subscribeToNotifications(String userId) {
    subscribeToTopic(TOPIC_PREFIX, userId);
    subscribeToTopic(TOPIC_PREFIX, ALL_TOPIC);
  }

  private void subscribeToTopic(String topic, String userId) {
    String definedTopic = String.format("%s_%s", topic, userId);

    FirebaseMessaging.getInstance().subscribeToTopic(definedTopic)
        .addOnCompleteListener(new OnCompleteListener<Void>() {
            @Override
            public void onComplete(@NonNull Task<Void> task) {
                String msg = task.isSuccessful() ? "Successfuly subscribing to topic %s" : "Failed subscribing to topic %s";
                if (task.isSuccessful() && topic!=ALL_TOPIC) {
                  registeredTopics.add(definedTopic);
                }
                Log.i("NOTIF", String.format(msg, definedTopic));
            }
        });
  }

  public void unsubscribeFromNotifications() {

    for (int idx=0; idx<registeredTopics.size(); idx++) {
      String topicName=registeredTopics.get(idx);
      FirebaseMessaging.getInstance().unsubscribeFromTopic(topicName)
        .addOnCompleteListener(new OnCompleteListener<Void>() {
          @Override
          public void onComplete(@NonNull Task<Void> task) {
            String msg = String.format("%s unregistering from topic %s",
              task.isSuccessful() ? "OK": "NOK",
              topicName
            );
            Log.i("NOTIF", msg);
          }
        });
      }
      registeredTopics.clear();
    }
}
