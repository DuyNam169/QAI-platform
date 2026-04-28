package com.QAI.aichatbot.service;

import com.QAI.aichatbot.dto.request.LoginRequest;
import com.QAI.aichatbot.dto.request.RegisterRequest;
import com.QAI.aichatbot.dto.response.AuthResponse;
import com.QAI.aichatbot.dto.response.UserResponse;
import com.QAI.aichatbot.entity.User;
import com.QAI.aichatbot.exception.BadRequestException;
import com.QAI.aichatbot.exception.UnauthorizedException;
import com.QAI.aichatbot.repository.UserRepository;
import com.QAI.aichatbot.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final GoogleOAuthService googleOAuthService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email này đã được đăng ký");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName().trim())
                .role(User.Role.USER)
                .build();

        user = userRepository.save(user);
        log.info("Người dùng mới đã đăng ký: {}", user.getEmail());

        return generateAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            // Không tiết lộ email có tồn tại hay không – bảo mật cơ bản
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedException("Tài khoản không tồn tại"));

        log.info("Người dùng đăng nhập: {}", user.getEmail());
        return generateAuthResponse(user);
    }

    /**
     * Đăng nhập / đăng ký bằng Google ID Token.
     *
     * Logic:
     * - Nếu email đã tồn tại → đăng nhập (kể cả tài khoản tạo bằng email/pass)
     * - Nếu email chưa tồn tại → tự động tạo tài khoản mới (không cần mật khẩu)
     *
     * Điều này cho phép user vốn dùng email/pass vẫn có thể dùng Google để đăng nhập
     * với cùng email – tiện lợi và phổ biến trong các app giáo dục.
     */
    @Transactional
    public AuthResponse loginWithGoogle(String googleIdToken) {
        GoogleOAuthService.GoogleUserInfo googleUser;
        try {
            googleUser = googleOAuthService.verifyToken(googleIdToken);
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("Google token không hợp lệ: " + e.getMessage());
        }

        String email = googleUser.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Tạo tài khoản mới từ Google – mật khẩu random không dùng được
                    log.info("Tạo tài khoản mới từ Google: {}", email);
                    User newUser = User.builder()
                            .email(email)
                            // Password encode chuỗi random – user này không thể login bằng password
                            .password(passwordEncoder.encode(
                                    "GOOGLE_OAUTH_" + java.util.UUID.randomUUID()))
                            .displayName(googleUser.getName() != null
                                    ? googleUser.getName()
                                    : email.split("@")[0])
                            .role(User.Role.USER)
                            .build();
                    return userRepository.save(newUser);
                });

        log.info("Đăng nhập Google thành công: {}", email);
        return generateAuthResponse(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token không được để trống");
        }

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String tokenType = jwtTokenProvider.getTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new UnauthorizedException("Token không phải refresh token");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Tài khoản không tồn tại"));

        return generateAuthResponse(user);
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.of(accessToken, refreshToken, UserResponse.from(user));
    }
}