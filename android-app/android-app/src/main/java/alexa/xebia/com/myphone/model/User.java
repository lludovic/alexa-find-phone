package alexa.xebia.com.myphone.model;

import java.util.ArrayList;
import java.util.List;

public class User {

    private String userId;

    private List<Device> devices = new ArrayList<>();

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<Device> getDevices() {
        return devices;
    }

    public void setDevices(List<Device> devices) {
        this.devices = devices;
    }
}
