package com.QAI.aichatbot.service;

import com.QAI.aichatbot.entity.Message;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AiServiceClient {

    private final WebClient webClient;
    private final SecretKey signingKey;

    public AiServiceClient(
            @Value("${ai.service.url}") String aiServiceUrl,
            @Value("${app.jwt.secret}") String jwtSecret) {
        this.webClient = WebClient.builder()
                .baseUrl(aiServiceUrl)
                .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // Tạo internal JWT token để gọi Python service
    private String generateInternalToken() {
        return Jwts.builder()
                .subject("spring-boot-service")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600_000))
                .signWith(signingKey)
                .compact();
    }

    public Mono<String> chat(String conversationId, String content, List<Message> history) {
        List<Map<String, String>> historyList = history.stream()
                .map(m -> Map.of(
                        "role", m.getRole().name().toLowerCase(),
                        "content", m.getContent()
                ))
                .collect(Collectors.toList());

        return webClient.post()
                .uri("/chat")
                .header("Authorization", "Bearer " + generateInternalToken())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of(
                        "conversation_id", conversationId,
                        "message", content,
                        "history", historyList
                ))
                .retrieve()
                .bodyToMono(String.class);
    }

    public Flux<String> streamChat(String conversationId, String content, List<Message> history) {
        List<Map<String, String>> historyList = history.stream()
                .map(m -> Map.of(
                        "role", m.getRole().name().toLowerCase(),
                        "content", m.getContent()
                ))
                .collect(Collectors.toList());

        return webClient.post()
                .uri("/chat/stream")
                .header("Authorization", "Bearer " + generateInternalToken())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of(
                        "conversation_id", conversationId,
                        "message", content,
                        "history", historyList
                ))
                .retrieve()
                .bodyToFlux(String.class);
    }

    public Mono<String> uploadDocument(String fileId, byte[] fileBytes, String filename) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() { return filename; }
        });
        builder.part("file_id", fileId);

        return webClient.post()
                .uri("/documents/add")
                .header("Authorization", "Bearer " + generateInternalToken())
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(String.class);
    }

    public Mono<Void> deleteDocument(String fileId) {
        return webClient.delete()
                .uri("/documents/" + fileId)
                .header("Authorization", "Bearer " + generateInternalToken())
                .retrieve()
                .bodyToMono(Void.class);
    }
}