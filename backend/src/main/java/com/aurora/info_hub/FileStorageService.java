package com.aurora.info_hub;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif",
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"
    );

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir,"sections");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf(".") + 1)
                            .toLowerCase(Locale.ROOT)
                    : "";

            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new IllegalArgumentException("Unsupported file type: ." + extension);
            }

            String fileName = UUID.randomUUID() + "." + extension;

            Path targetPath = uploadPath.resolve(fileName);
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/sections/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }
        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            Path targetPath = Paths.get(uploadDir, "sections", fileName);
            Files.deleteIfExists(targetPath);
        } catch (IOException e) {
            // Best-effort: an orphaned file on disk isn't worth failing the request over.
        }
    }
}