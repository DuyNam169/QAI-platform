package com.QAI.aichatbot.repository;

import com.QAI.aichatbot.entity.Document;
import com.QAI.aichatbot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUserOrderByCreatedAtDesc(User user);

    Optional<Document> findByIdAndUser(Long id, User user);
}
