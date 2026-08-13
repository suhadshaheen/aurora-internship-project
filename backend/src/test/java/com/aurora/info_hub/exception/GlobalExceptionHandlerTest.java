package com.aurora.info_hub.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @SuppressWarnings("unchecked")
    private Map<String, Object> bodyOf(ResponseEntity<Object> response) {
        return (Map<String, Object>) response.getBody();
    }

    @Test
    void handleNotFound_shouldReturn404WithTheExceptionMessage() {
        ResponseEntity<Object> response = handler.handleNotFound(new NotFoundException("User not found"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(bodyOf(response)).containsEntry("message", "User not found");
        assertThat(bodyOf(response)).containsEntry("status", 404);
        assertThat(bodyOf(response)).containsKey("timestamp");
    }

    @Test
    void handleConflict_shouldReturn409WithTheExceptionMessage() {
        ResponseEntity<Object> response =
                handler.handleConflict(new ConflictException("Email already in use"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(bodyOf(response)).containsEntry("message", "Email already in use");
    }

    @Test
    void handleBadRequest_shouldReturn400WithTheExceptionMessage() {
        ResponseEntity<Object> response =
                handler.handleBadRequest(new IllegalArgumentException("Invalid role: HACKER"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(bodyOf(response)).containsEntry("message", "Invalid role: HACKER");
    }

    @Test
    void handleAuth_shouldReturn401WithAGenericSafeMessage_regardlessOfTheRealExceptionMessage() {
        ResponseEntity<Object> response =
                handler.handleAuth(new BadCredentialsException("some internal detail we don't want leaked"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        // Must NOT leak the underlying exception's message - always the same generic text.
        assertThat(bodyOf(response))
                .containsEntry("message", "Incorrect email or password. Please try again.");
    }

    @Test
    void handleAccessDenied_shouldReturn403WithTheExceptionMessage() {
        ResponseEntity<Object> response =
                handler.handleAccessDenied(new AccessDeniedException("You can only edit your own comments"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(bodyOf(response)).containsEntry("message", "You can only edit your own comments");
    }

    @Test
    void handleUnreadable_shouldReturn400WithAGenericMessage_regardlessOfTheRealParsingError() {
        HttpMessageNotReadableException ex = mock(HttpMessageNotReadableException.class);

        ResponseEntity<Object> response = handler.handleUnreadable(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(bodyOf(response)).containsEntry("message", "Malformed request body");
    }

    @Test
    void handleMethodNotAllowed_shouldReturn405WithTheExceptionMessage() {
        HttpRequestMethodNotSupportedException ex =
                new HttpRequestMethodNotSupportedException("PUT", List.of("GET", "POST"));

        ResponseEntity<Object> response = handler.handleMethodNotAllowed(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
        assertThat(bodyOf(response)).containsKey("message");
    }

    @Test
    void handleValidation_shouldReturn400WithFieldLevelErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError emailError = new FieldError("request", "email", "Email must be valid");
        FieldError passwordError = new FieldError("request", "password", "Password is required");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(emailError, passwordError));

        ResponseEntity<Object> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        Map<String, Object> body = bodyOf(response);
        assertThat(body).containsEntry("message", "Validation failed");

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) body.get("errors");
        assertThat(errors)
                .containsEntry("email", "Email must be valid")
                .containsEntry("password", "Password is required");
    }

    @Test
    void handleValidation_shouldReturnEmptyErrorsMap_whenThereAreNoFieldErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of());

        ResponseEntity<Object> response = handler.handleValidation(ex);

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) bodyOf(response).get("errors");
        assertThat(errors).isEmpty();
    }

    @Test
    void handleUnexpected_shouldReturn500WithAGenericMessage_neverLeakingTheStackTraceOrRealMessage() {
        ResponseEntity<Object> response =
                handler.handleUnexpected(new RuntimeException("NullPointerException at line 42 in SecretService"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(bodyOf(response)).containsEntry("message", "Something went wrong");
    }

    @Test
    void everyHandledResponse_shouldIncludeATimestampAndStatusCode_inTheBody() {
        ResponseEntity<Object> response = handler.handleNotFound(new NotFoundException("x"));

        Map<String, Object> body = bodyOf(response);
        assertThat(body).containsKeys("timestamp", "status", "message");
    }
}