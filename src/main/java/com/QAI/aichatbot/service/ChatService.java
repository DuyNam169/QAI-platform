package com.QAI.aichatbot.service;

import com.QAI.aichatbot.dto.request.ChatMessageRequest;
import com.QAI.aichatbot.dto.response.ChatMessageResponse;
import com.QAI.aichatbot.entity.Conversation;
import com.QAI.aichatbot.entity.Message;
import com.QAI.aichatbot.entity.User;
import com.QAI.aichatbot.exception.ResourceNotFoundException;
import com.QAI.aichatbot.repository.ConversationRepository;
import com.QAI.aichatbot.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final AiServiceClient aiServiceClient;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public ChatMessageResponse sendMessage(Long conversationId, ChatMessageRequest request, User user) {
        Conversation conversation = getConversation(conversationId, user);

        // Lấy lịch sử hội thoại để gửi context
        List<Message> history = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId);

        // Save user message
        saveMessage(conversation, Message.MessageRole.USER, request.getContent(), null);

        // Gọi Python AI service
        String aiResponse = aiServiceClient
                .chat(conversationId.toString(), request.getContent(), history)
                .block();

        // Save assistant message
        Message assistantMessage = saveMessage(
                conversation, Message.MessageRole.ASSISTANT, aiResponse, "gemini");

        conversation.setUpdatedAt(java.time.LocalDateTime.now());
        conversationRepository.save(conversation);

        return ChatMessageResponse.from(assistantMessage);
    }

    public Flux<String> streamMessage(Long conversationId, String content, User user) {
        Conversation conversation = getConversation(conversationId, user);

        List<Message> history = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId);

        saveMessage(conversation, Message.MessageRole.USER, content, null);

        AtomicReference<StringBuilder> fullResponse = new AtomicReference<>(new StringBuilder());

        return aiServiceClient
                .streamChat(conversationId.toString(), content, history)
                .doOnNext(chunk -> fullResponse.get().append(chunk))
                .doOnComplete(() -> {
                    String complete = fullResponse.get().toString();
                    if (!complete.isEmpty()) {
                        saveMessage(conversation, Message.MessageRole.ASSISTANT, complete, "gemini");
                        conversation.setUpdatedAt(java.time.LocalDateTime.now());
                        conversationRepository.save(conversation);
                    }
                })
                .doOnError(e -> log.error("Stream error conversation {}: {}", conversationId, e.getMessage()));
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Long conversationId, User user) {
        Conversation conversation = getConversation(conversationId, user);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId())
                .stream()
                .map(ChatMessageResponse::from)
                .toList();
    }

    private Conversation getConversation(Long conversationId, User user) {
        return conversationRepository.findByIdAndUser(conversationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
    }

    private Message saveMessage(Conversation conversation, Message.MessageRole role,
                                String content, String model) {
        Message message = Message.builder()
                .conversation(conversation)
                .role(role)
                .content(content)
                .model(model)
                .build();
        return messageRepository.save(message);
    }
}