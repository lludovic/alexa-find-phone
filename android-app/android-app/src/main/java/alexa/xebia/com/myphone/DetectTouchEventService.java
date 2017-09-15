package alexa.xebia.com.myphone;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;

public class DetectTouchEventService extends Service implements View.OnTouchListener, View.OnKeyListener {
    private static final String TAG = "DetectTouchEventService";
    private Button mButton;
    private Ringtone ringtone;
    private Service myService;

    @Override
    public void onCreate() {
        super.onCreate();
        myService = this;
        Log.d(TAG, "Start Service");
        mButton = new Button(this);
        mButton.setText("");
        mButton.setBackgroundColor(getColor(android.R.color.transparent));
        mButton.setAlpha(0);
        mButton.setOnKeyListener(this);
        mButton.setOnTouchListener(this);

        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_TOAST,
                WindowManager.LayoutParams.TYPE_SYSTEM_ALERT
                        | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
                        | WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
                PixelFormat.TRANSPARENT);
        params.gravity = Gravity.BOTTOM | Gravity.RIGHT;
        params.setTitle("Load Average");
        WindowManager wm = (WindowManager) getSystemService(WINDOW_SERVICE);
        wm.addView(mButton, params);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        super.onStartCommand(intent, flags, startId);
        playRingTone();
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mButton != null) {
            ((WindowManager) getSystemService(WINDOW_SERVICE)).removeView(mButton);
            mButton = null;
        }
    }


    @Override
    public boolean onTouch(View v, MotionEvent event) {
        Log.d(TAG, "Destroy Service");
        stopRingtone();
        return true;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void playRingTone() {
        AudioManager audioManager = (AudioManager) this.getApplicationContext().getSystemService(Context.AUDIO_SERVICE);
        int maxVolumeForDevice = audioManager.getStreamMaxVolume(AudioManager.STREAM_RING);
//        int maxVolumeForDevice = audioManager.getStreamVolume(AudioManager.STREAM_RING);
        audioManager.setStreamVolume(AudioManager.STREAM_RING, maxVolumeForDevice, AudioManager.FLAG_ALLOW_RINGER_MODES);
        Uri alert = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);

        if (alert == null) {
            // alert is null, using backup
            alert = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);

            // I can't see this ever being null (as always have a default notification)
            // but just incase
            if (alert == null) {
                // alert backup is null, using 2nd backup
                alert = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            }
        }
        ringtone = RingtoneManager.getRingtone(getApplicationContext(), alert);
        ringtone.play();
    }

    @Override
    public boolean onKey(View v, int keyCode, KeyEvent event) {
        Log.d(TAG, "Key pressed :" + keyCode);
        stopRingtone();
        return true;
    }

    private void stopRingtone() {
        ringtone.stop();
        myService.stopSelf();
    }

}
