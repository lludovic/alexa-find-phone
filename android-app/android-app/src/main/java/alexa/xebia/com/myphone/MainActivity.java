package alexa.xebia.com.myphone;

import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Point;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.vision.barcode.Barcode;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import alexa.xebia.com.myphone.barcode.BarcodeCaptureActivity;
import alexa.xebia.com.myphone.model.Device;
import alexa.xebia.com.myphone.model.User;

public class MainActivity extends AppCompatActivity implements View.OnClickListener {

    // lambda endpoint
    // todo change to use a specific domain
    private static final String phonesUrl = "https://n3yu1uj4m5.execute-api.eu-west-1.amazonaws.com/dev/users/";

    private static final String USER_KEY = "USER_ID";

    private static final int BARCODE_READER_REQUEST_CODE = 1;

    private final static String TAG = "MainActivity";

    private EditText userIdText;

    private EditText phoneNameText;

    private String userId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        SharedPreferences preferences = getPreferences(MODE_PRIVATE);

        if (preferences.contains(USER_KEY)) {
            userId = preferences.getString(USER_KEY, "");
            //todo implement hide user registration
        } else {
            //show input to register user
        }

        userIdText = (EditText) findViewById(R.id.user_id);
        userIdText.setText(userId);
        phoneNameText = (EditText) findViewById(R.id.phone_name);
        phoneNameText.setText("my");

        Button logTokenButton = (Button) findViewById(R.id.register_user_button);
        logTokenButton.setOnClickListener(this);

        Button scanBarcodeButton = (Button) findViewById(R.id.scan_barcode_button);
        scanBarcodeButton.setOnClickListener(this);
    }

    public void createUser(final User user) {
        Gson gson = new GsonBuilder().create();

        Log.d(TAG, "create user :" + gson.toJson(user));

        RequestQueue queue = Volley.newRequestQueue(this);

        try {
            JsonObjectRequest createUserRequest = new JsonObjectRequest(Request.Method.PUT, phonesUrl + user.getUserId(),
                    new JSONObject(gson.toJson(user)), new Response.Listener<JSONObject>() {
                @Override
                public void onResponse(JSONObject response) {
                    Toast.makeText(MainActivity.this, "device register successfully", Toast.LENGTH_LONG).show();
                    Log.d(TAG, "device register successfully " + response.toString());
                    SharedPreferences preferences = getPreferences(MODE_PRIVATE);
                    SharedPreferences.Editor edit = preferences.edit();
                    edit.putString(USER_KEY, user.getUserId());
                    edit.commit();
                }
            }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.e(TAG, "error on update " + error.getMessage(), error);
//                    Toast.makeText(MainActivity.this, "device registration failed : "+error.getMessage(), Toast.LENGTH_LONG).show();
                }
            });

            // Add the request to the RequestQueue.
            queue.add(createUserRequest);

        } catch (Exception ex) {
            ex.printStackTrace();
            Toast.makeText(MainActivity.this, "device registration failed", Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        Log.d(TAG, "Ringtone stop");
        Uri alert = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        Ringtone ringtone = RingtoneManager.getRingtone(getApplicationContext(), alert);
        if (ringtone.isPlaying()) {
            ringtone.stop();
        }

        return false;
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.register_user_button:
                // Get token
                String token = FirebaseInstanceId.getInstance().getToken();

                String msg = getString(R.string.msg_token_fmt, token);
                Log.d(TAG, msg);

                User user = new User();
                user.setUserId(userIdText.getText().toString());
                List<Device> devices = new ArrayList<>();
                //todo add field to make user set phone name
                devices.add(new Device(phoneNameText.getText().toString(), token));
                user.setDevices(devices);

                this.createUser(user);

                Toast.makeText(MainActivity.this, msg, Toast.LENGTH_LONG).show();
                break;
            case R.id.scan_barcode_button:
                Intent intent = new Intent(getApplicationContext(), BarcodeCaptureActivity.class);
                startActivityForResult(intent, BARCODE_READER_REQUEST_CODE);
                break;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == BARCODE_READER_REQUEST_CODE) {
            if (resultCode == CommonStatusCodes.SUCCESS) {
                if (data != null) {
                    Barcode barcode = data.getParcelableExtra(BarcodeCaptureActivity.BarcodeObject);
                    Point[] p = barcode.cornerPoints;
                    userIdText.setText(barcode.displayValue);
                } else userIdText.setText(R.string.no_barcode_captured);
            } else Log.e(TAG, String.format(getString(R.string.barcode_error_format),
                    CommonStatusCodes.getStatusCodeString(resultCode)));
        } else super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onStop() {
        super.onStop();
    }
}
