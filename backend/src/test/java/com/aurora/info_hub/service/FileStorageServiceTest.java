package com.aurora.info_hub.service;


import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.MockedStatic;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService buildService() {
        FileStorageService service = new FileStorageService();
        ReflectionTestUtils.setField(service, "uploadDir", tempDir.toString());
        return service;
    }


    @Test
    @DisplayName("test valid store file creates sections directory and returns correct url")
    void storeFileCreatesDirectoryAndReturnsUrl() throws IOException {
        FileStorageService service = buildService();
        MultipartFile file = new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", "some image content".getBytes());

        String result = service.storeFile(file);

        assertThat(result).startsWith("/uploads/sections/");
        assertThat(result).endsWith(".jpg");

        Path sectionsDir = tempDir.resolve("sections");
        assertThat(Files.exists(sectionsDir)).isTrue();

        String storedFileName = result.substring(result.lastIndexOf('/') + 1);
        assertThat(Files.exists(sectionsDir.resolve(storedFileName))).isTrue();
    }

    @Test
    @DisplayName("test valid store file preserves original file extension")
    void storeFilePreservesExtension() {
        FileStorageService service = buildService();
        MultipartFile file = new MockMultipartFile(
                "file", "report.pdf", "application/pdf", "pdf content".getBytes());

        String result = service.storeFile(file);

        assertThat(result).endsWith(".pdf");
    }

    @Test
    @DisplayName("test valid store file with no extension stores file without extension")
    void storeFileWithNoExtension() {
        FileStorageService service = buildService();
        MultipartFile file = new MockMultipartFile("file", "README", "text/plain", "content".getBytes());

        String result = service.storeFile(file);

        String storedFileName = result.substring(result.lastIndexOf('/') + 1);
        assertThat(storedFileName).doesNotContain(".");
    }

    @Test
    @DisplayName("test valid store file with null original filename stores file without extension")
    void storeFileWithNullOriginalFilename() {
        FileStorageService service = buildService();
        MultipartFile file = new MockMultipartFile(
                "file", null, "application/octet-stream", "content".getBytes());

        String result = service.storeFile(file);

        String storedFileName = result.substring(result.lastIndexOf('/') + 1);
        assertThat(storedFileName).doesNotContain(".");
    }

    @Test
    @DisplayName("test valid store file generates a unique file name for each call")
    void storeFileGeneratesUniqueNames() {
        FileStorageService service = buildService();
        MultipartFile file1 = new MockMultipartFile("file", "a.txt", "text/plain", "1".getBytes());
        MultipartFile file2 = new MockMultipartFile("file", "a.txt", "text/plain", "2".getBytes());

        String result1 = service.storeFile(file1);
        String result2 = service.storeFile(file2);

        assertThat(result1).isNotEqualTo(result2);
    }

    @Test
    @DisplayName("test invalid store file throws RuntimeException when reading the file fails")
    void storeFileThrowsWhenReadFails() throws IOException {
        FileStorageService service = buildService();

        MultipartFile file = org.mockito.Mockito.mock(MultipartFile.class);
        when(file.getOriginalFilename()).thenReturn("broken.txt");
        when(file.getInputStream()).thenThrow(new IOException("Disk read error"));

        assertThatThrownBy(() -> service.storeFile(file)).isInstanceOf(RuntimeException.class).hasMessage("Failed to store file").hasCauseInstanceOf(IOException.class);
    }

    @Test
    @DisplayName("test invalid store file throws RuntimeException when directory creation fails")
    void storeFileThrowsWhenDirectoryCreationFails() {
        FileStorageService service = buildService();
        MultipartFile file = new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", "content".getBytes());

        try (MockedStatic<Files> filesMock = mockStatic(Files.class)) {
            filesMock.when(() -> Files.exists(any(Path.class))).thenReturn(false);
            filesMock.when(() -> Files.createDirectories(any(Path.class)))
                    .thenThrow(new IOException("Permission denied"));

            assertThatThrownBy(() -> service.storeFile(file))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Failed to store file")
                    .hasCauseInstanceOf(IOException.class);
        }
    }


    @Test
    @DisplayName("test valid delete file removes an existing file")
    void deleteFileRemovesExistingFile() throws IOException {
        FileStorageService service = buildService();
        Path sectionsDir = tempDir.resolve("sections");
        Files.createDirectories(sectionsDir);
        Path existingFile = sectionsDir.resolve("existing.jpg");
        Files.writeString(existingFile, "content");

        service.deleteFile("/uploads/sections/existing.jpg");

        assertThat(Files.exists(existingFile)).isFalse();
    }

    @Test
    @DisplayName("test valid delete file does nothing when fileUrl is null")
    void deleteFileDoesNothingWhenUrlIsNull() {
        FileStorageService service = buildService();

        assertThatCode(() -> service.deleteFile(null)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("test valid delete file does nothing when fileUrl is blank")
    void deleteFileDoesNothingWhenUrlIsBlank() {
        FileStorageService service = buildService();

        assertThatCode(() -> service.deleteFile("   ")).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("test valid delete file does not throw when file does not exist")
    void deleteFileDoesNotThrowWhenFileDoesNotExist() {
        FileStorageService service = buildService();

        assertThatCode(() -> service.deleteFile("/uploads/sections/does-not-exist.jpg"))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("test invalid delete file swallows IOException silently")
    void deleteFileSwallowsIOException() {
        FileStorageService service = buildService();

        try (MockedStatic<Files> filesMock = mockStatic(Files.class)) {
            filesMock.when(() -> Files.deleteIfExists(any(Path.class)))
                    .thenThrow(new IOException("Disk error"));

            assertThatCode(() -> service.deleteFile("/uploads/sections/some-file.jpg"))
                    .doesNotThrowAnyException();
        }
    }


}