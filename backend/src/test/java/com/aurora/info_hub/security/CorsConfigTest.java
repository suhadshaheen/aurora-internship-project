package com.aurora.info_hub.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.assertj.core.api.Assertions.assertThat;

class CorsConfigTest {

    private CorsConfig buildConfig(String frontendUrl) {
        CorsConfig corsConfig = new CorsConfig();
        ReflectionTestUtils.setField(corsConfig, "frontendUrl", frontendUrl);
        return corsConfig;
    }

    private CorsConfiguration resolveConfigFor(CorsConfigurationSource source, String path) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI(path);
        return source.getCorsConfiguration(request);
    }

    @Test
    void corsConfigurationSource_shouldAllowOnlyTheConfiguredFrontendOrigin() {
        CorsConfig corsConfig = buildConfig("https://my-frontend.example.com");
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();

        CorsConfiguration configuration = resolveConfigFor(source, "/users");

        assertThat(configuration).isNotNull();
        assertThat(configuration.getAllowedOrigins())
                .containsExactly("https://my-frontend.example.com");
    }

    @Test
    void corsConfigurationSource_shouldAllowAllStandardHttpMethods() {
        CorsConfig corsConfig = buildConfig("https://my-frontend.example.com");
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();

        CorsConfiguration configuration = resolveConfigFor(source, "/users");

        assertThat(configuration.getAllowedMethods())
                .containsExactlyInAnyOrder("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
    }

    @Test
    void corsConfigurationSource_shouldAllowAllHeaders() {
        CorsConfig corsConfig = buildConfig("https://my-frontend.example.com");
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();

        CorsConfiguration configuration = resolveConfigFor(source, "/users");

        assertThat(configuration.getAllowedHeaders()).containsExactly("*");
    }

    @Test
    void corsConfigurationSource_shouldAllowCredentials() {
        CorsConfig corsConfig = buildConfig("https://my-frontend.example.com");
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();

        CorsConfiguration configuration = resolveConfigFor(source, "/users");

        assertThat(configuration.getAllowCredentials()).isTrue();
    }

    @Test
    void corsConfigurationSource_shouldApplyToAllPaths() {
        CorsConfig corsConfig = buildConfig("https://my-frontend.example.com");
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();

        assertThat(resolveConfigFor(source, "/users")).isNotNull();
        assertThat(resolveConfigFor(source, "/auth/login")).isNotNull();
        assertThat(resolveConfigFor(source, "/sections/1/comments")).isNotNull();
    }

    @Test
    void corsConfigurationSource_shouldReflectDifferentConfiguredFrontendUrl() {
        CorsConfig corsConfig = buildConfig("http://localhost:4200");
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();

        CorsConfiguration configuration = resolveConfigFor(source, "/users");

        assertThat(configuration.getAllowedOrigins()).containsExactly("http://localhost:4200");
    }
}
