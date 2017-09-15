package alexa.xebia.com.myphone.model;

public class Device {

    private String name;

    private String token;

    public Device() {
    }

    public Device(String name, String token) {
        this.name = name;
        this.token = token;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
