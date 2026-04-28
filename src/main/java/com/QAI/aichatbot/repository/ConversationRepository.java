package com.QAI.aichatbot.repository;

import com.QAI.aichatbot.entity.Conversation;
import com.QAI.aichatbot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByUserOrderByUpdatedAtDesc(User user);

    Optional<Conversation> findByIdAndUser(Long id, User user);

    long countByUser(User user);
}
