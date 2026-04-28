package com.QAI.aichatbot.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Service xác thực Google ID Token từ phía client (Google Sign-In popup flow).
 *
 * Flow:
 *   1. Frontend dùng Google Identity Services JS SDK để lấy credential (ID Token)
 *   2. Frontend gửi ID Token này lên backend qua /api/auth/google
 *   3. Backend verify token với Google và trả về JWT của app
 *
 * Không cần redirect OAuth2 callback – đơn giản và phù hợp với SPA.
 */
@Slf4j
@Service
public class GoogleOAuthService {

    private final String clientId;
    private final GoogleIdTokenVerifier verifier;

    public GoogleOAuthService(@Value("${app.google.client-id}") String clientId) {
        this.clientId = clientId;
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    /**
     * Verify Google ID Token và trả về payload nếu hợp lệ.
     * Ném IllegalArgumentException nếu token không hợp lệ hoặc hết hạn.
     */
    public GoogleUserInfo verifyToken(String idToken) {
        try {
            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new IllegalArgumentException("Google ID Token không hợp lệ hoặc đã hết hạn");
            }

            GoogleIdToken.Payload payload = token.getPayload();

            // Kiểm tra email đã verified chưa
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new IllegalArgumentException("Email Google chưa được xác thực");
            }

            return GoogleUserInfo.builder()
                    .googleId(payload.getSubject())
                    .email(payload.getEmail())
                    .name((String) payload.get("name"))
                    .pictureUrl((String) payload.get("picture"))
                    .build();

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi verify Google token: {}", e.getMessage());
            throw new IllegalArgumentException("Không thể xác thực Google token: " + e.getMessage());
        }
    }

    /**
     * DTO chứa thông tin user từ Google.
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class GoogleUserInfo {
        private String googleId;
        private String email;
        private String name;
        private String pictureUrl;
    }
}