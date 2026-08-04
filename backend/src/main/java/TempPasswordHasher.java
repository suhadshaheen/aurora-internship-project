import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TempPasswordHasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "Enashamdan123";
        String hashed = encoder.encode(rawPassword);
        System.out.println(hashed);
    }
}