package com.QAI.aichatbot.service;

import com.QAI.aichatbot.dto.response.DocumentResponse;
import com.QAI.aichatbot.entity.Document;
import com.QAI.aichatbot.entity.User;
import com.QAI.aichatbot.exception.BadRequestException;
import com.QAI.aichatbot.exception.ResourceNotFoundException;
import com.QAI.aichatbot.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final AiServiceClient aiServiceClient;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/markdown",
            "text/csv"
    );

    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file, User user) {
        validateFile(file);

        Document document = Document.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .status(Document.ProcessingStatus.PROCESSING)
                .build();
        document = documentRepository.save(document);

        processDocumentAsync(document.getId(), file);
        return DocumentResponse.from(document);
    }

    @Async
    public void processDocumentAsync(Long documentId, MultipartFile file) {
        try {
            log.info("Sending document {} to Python AI service", documentId);

            byte[] bytes = file.getBytes();
            String filename = file.getOriginalFilename();

            // Gửi sang Python RAG API
            String result = aiServiceClient
                    .uploadDocument(documentId.toString(), bytes, filename)
                    .block();

            log.info("Python AI service response: {}", result);

            // Cập nhật status
            Document document = documentRepository.findById(documentId).orElseThrow();
            document.setStatus(Document.ProcessingStatus.INDEXED);
            documentRepository.save(document);

            log.info("Document {} indexed successfully", documentId);

        } catch (Exception e) {
            log.error("Failed to process document {}: {}", documentId, e.getMessage());
            documentRepository.findById(documentId).ifPresent(doc -> {
                doc.setStatus(Document.ProcessingStatus.FAILED);
                doc.setErrorMessage(e.getMessage());
                documentRepository.save(doc);
            });
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getUserDocuments(User user) {
        return documentRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocument(Long id, User user) {
        Document document = documentRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
        return DocumentResponse.from(document);
    }

    @Transactional
    public void deleteDocument(Long id, User user) {
        Document document = documentRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));

        try {
            aiServiceClient.deleteDocument(id.toString()).block();
        } catch (Exception e) {
            log.warn("Could not delete vectors for document {}: {}", id, e.getMessage());
        }

        documentRepository.delete(document);
        log.info("Document deleted: {}", id);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw new BadRequestException("File is empty");
        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType()))
            throw new BadRequestException("File type not supported. Allowed: PDF, DOCX, TXT, MD, CSV");
        if (file.getSize() > 20 * 1024 * 1024)
            throw new BadRequestException("File size exceeds 20MB limit");
    }
}