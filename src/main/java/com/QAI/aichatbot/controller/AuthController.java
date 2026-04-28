package com.QAI.aichatbot.controller;

import com.QAI.aichatbot.dto.request.LoginRequest;
import com.QAI.aichatbot.dto.request.RegisterRequest;
import com.QAI.aichatbot.dto.response.AuthResponse;
import com.QAI.aichatbot.dto.response.UserResponse;
import com.QAI.aichatbot.security.CustomUserDetails;
import com.QAI.aichatbot.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Đăng nhập, đăng ký, refresh token, Google OAuth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới bằng email và mật khẩu")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập bằng email và mật khẩu")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Đăng nhập / đăng ký bằng Google.
     *
     * Frontend gửi lên Google ID Token (credential) nhận được từ Google Identity Services.
     * Backend verify token với Google, sau đó trả về JWT của app.
     *
     * Request body: { "credential": "<google_id_token>" }
     */
    @PostMapping("/google")
    @Operation(summary = "Đăng nhập / đăng ký bằng tài khoản Google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody Map<String, String> body) {
        String credential = body.get("credential");
        if (credential == null || credential.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(authService.loginWithGoogle(credential));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Làm mới access token bằng refresh token")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin người dùng hiện tại")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(UserResponse.builder()
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .displayName(userDetails.getDisplayName())
                .role(userDetails.getRole().name())
                .build());
    }
}