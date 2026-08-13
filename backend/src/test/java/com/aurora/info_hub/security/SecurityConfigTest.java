package com.aurora.info_hub.security;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

/**
 * Full-context integration test for the authorization rules defined in
 * {@link SecurityConfig}. Unlike @WebMvcTest slices (which do NOT load this
 * custom SecurityConfig and instead fall back to Spring Security's own
 * default filter chain), this test boots the real application context so
 * the actual permitAll/hasRole/authenticated rules are exercised.
 *
 * Requires a reachable Postgres database (same as InfoHubApplicationTests),
 * since the full context is loaded including JPA/Flyway.
 *
 * NOTE on status codes: anonymous (unauthenticated) requests to protected
 * endpoints return 403 Forbidden here, not 401 Unauthorized. This is
 * expected given the current SecurityConfig: since no httpBasic()/
 * formLogin() (or a custom AuthenticationEntryPoint) is configured, Spring
 * Security falls back to its default Http403ForbiddenEntryPoint for any
 * unauthenticated request, regardless of whether the "real" issue is a
 * missing identity (401) or an insufficient role (403). If a custom
 * AuthenticationEntryPoint returning 401 is added to SecurityConfig later,
 * these anonymous-user test expectations should be updated back to 401.
 *
 * We only assert on whether a request was rejected by the SECURITY layer
 * (401 Unauthorized / 403 Forbidden) or allowed to proceed past it. Requests
 * that are authorized may still return 200, 400, or 404 depending on
 * downstream handling (missing body, no matching route, etc.) - that's
 * irrelevant here since we're only testing the authorization rules
 * themselves, not full endpoint behavior.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    private void assertAllowedPastSecurity(MvcResult result) {
        int status = result.getResponse().getStatus();
        assertThat(status).as("expected request to pass authorization").isNotIn(401, 403);
    }

    private void assertForbidden(MvcResult result) {
        assertThat(result.getResponse().getStatus()).isEqualTo(403);
    }

    @Nested
    class PublicEndpoints {

        @Test
        @WithAnonymousUser
        void authLogin_shouldBeAccessible_withoutAuthentication() throws Exception {
            MvcResult result = mockMvc.perform(post("/auth/login")
                            .contentType("application/json")
                            .content("{}"))
                    .andReturn();

            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void getSections_shouldBeAccessible_withoutAuthentication() throws Exception {
            MvcResult result = mockMvc.perform(get("/sections/1")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void getCategories_shouldBeAccessible_withoutAuthentication() throws Exception {
            MvcResult result = mockMvc.perform(get("/categories/1")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void getUploads_shouldBeAccessible_withoutAuthentication() throws Exception {
            MvcResult result = mockMvc.perform(get("/uploads/some-file.png")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void getComments_shouldBeAccessible_withoutAuthentication() throws Exception {
            MvcResult result = mockMvc.perform(get("/comments/1")).andReturn();
            assertAllowedPastSecurity(result);
        }
    }

    @Nested
    class SectionsWriteAccess {

        @Test
        @WithAnonymousUser
        void postSections_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(post("/sections/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "GUEST")
        void postSections_shouldReturn403_forGuestRole() throws Exception {
            MvcResult result = mockMvc.perform(post("/sections/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "EMPLOYEE")
        void postSections_shouldBeAllowed_forEmployeeRole() throws Exception {
            MvcResult result = mockMvc.perform(post("/sections/1")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void putSections_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(put("/sections/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "GUEST")
        void putSections_shouldReturn403_forGuestRole() throws Exception {
            MvcResult result = mockMvc.perform(put("/sections/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        void putSections_shouldBeAllowed_forAdminRole() throws Exception {
            MvcResult result = mockMvc.perform(put("/sections/1")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void patchSections_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(patch("/sections/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "GUEST")
        void patchSections_shouldReturn403_forGuestRole() throws Exception {
            MvcResult result = mockMvc.perform(patch("/sections/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "EMPLOYEE")
        void patchSections_shouldBeAllowed_forEmployeeRole() throws Exception {
            MvcResult result = mockMvc.perform(patch("/sections/1")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void deleteSections_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(delete("/sections/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "GUEST")
        void deleteSections_shouldReturn403_forGuestRole() throws Exception {
            MvcResult result = mockMvc.perform(delete("/sections/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        void deleteSections_shouldBeAllowed_forAdminRole() throws Exception {
            MvcResult result = mockMvc.perform(delete("/sections/1")).andReturn();
            assertAllowedPastSecurity(result);
        }
    }

    @Nested
    class CommentsWriteAccess {

        @Test
        @WithAnonymousUser
        void postComments_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(post("/comments")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "GUEST")
        void postComments_shouldReturn403_forGuestRole() throws Exception {
            MvcResult result = mockMvc.perform(post("/comments")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "EMPLOYEE")
        void postComments_shouldBeAllowed_forEmployeeRole() throws Exception {
            MvcResult result = mockMvc.perform(post("/comments")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void patchComments_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(patch("/comments/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "GUEST")
        void patchComments_shouldReturn403_forGuestRole() throws Exception {
            MvcResult result = mockMvc.perform(patch("/comments/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        void patchComments_shouldBeAllowed_forAdminRole() throws Exception {
            MvcResult result = mockMvc.perform(patch("/comments/1")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void deleteComments_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(delete("/comments/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "GUEST")
        void deleteComments_shouldReturn403_forGuestRole() throws Exception {
            MvcResult result = mockMvc.perform(delete("/comments/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        void deleteComments_shouldBeAllowed_forAdminRole() throws Exception {
            MvcResult result = mockMvc.perform(delete("/comments/1")).andReturn();
            assertAllowedPastSecurity(result);
        }
    }

    @Nested
    class CategoriesWriteAccess {

        @Test
        @WithAnonymousUser
        void postCategories_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(post("/categories")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "EMPLOYEE")
        void postCategories_shouldReturn403_forEmployeeRole() throws Exception {
            // Categories are ADMIN-only, unlike sections/comments which also allow EMPLOYEE.
            MvcResult result = mockMvc.perform(post("/categories")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        void postCategories_shouldBeAllowed_forAdminRole() throws Exception {
            MvcResult result = mockMvc.perform(post("/categories")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void deleteCategories_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(delete("/categories/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "EMPLOYEE")
        void deleteCategories_shouldReturn403_forEmployeeRole() throws Exception {
            MvcResult result = mockMvc.perform(delete("/categories/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        void deleteCategories_shouldBeAllowed_forAdminRole() throws Exception {
            MvcResult result = mockMvc.perform(delete("/categories/1")).andReturn();
            assertAllowedPastSecurity(result);
        }
    }

    @Nested
    class UsersAdminOnlyAccess {

        @Test
        @WithAnonymousUser
        void getUsers_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(get("/users")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "EMPLOYEE")
        void getUsers_shouldReturn403_forEmployeeRole() throws Exception {
            // /users/** is ADMIN-only for ALL methods, including GET (unlike
            // sections/categories/comments where GET is public).
            MvcResult result = mockMvc.perform(get("/users")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "GUEST")
        void getUsers_shouldReturn403_forGuestRole() throws Exception {
            MvcResult result = mockMvc.perform(get("/users")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        void getUsers_shouldBeAllowed_forAdminRole() throws Exception {
            MvcResult result = mockMvc.perform(get("/users")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        void postUsers_shouldBeAllowed_forAdminRole() throws Exception {
            MvcResult result = mockMvc.perform(post("/users")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void postUsers_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(post("/users")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "EMPLOYEE")
        void postUsers_shouldReturn403_forEmployeeRole() throws Exception {
            MvcResult result = mockMvc.perform(post("/users")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "GUEST")
        void postUsers_shouldReturn403_forGuestRole() throws Exception {
            MvcResult result = mockMvc.perform(post("/users")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        void deleteUsers_shouldBeAllowed_forAdminRole() throws Exception {
            MvcResult result = mockMvc.perform(delete("/users/1")).andReturn();
            assertAllowedPastSecurity(result);
        }

        @Test
        @WithAnonymousUser
        void deleteUsers_shouldReturn403_whenAnonymous() throws Exception {
            MvcResult result = mockMvc.perform(delete("/users/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "EMPLOYEE")
        void deleteUsers_shouldReturn403_forEmployeeRole() throws Exception {
            MvcResult result = mockMvc.perform(delete("/users/1")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "GUEST")
        void deleteUsers_shouldReturn403_forGuestRole() throws Exception {
            MvcResult result = mockMvc.perform(delete("/users/1")).andReturn();
            assertForbidden(result);
        }
    }

    @Nested
    class DefaultAuthenticatedFallback {

        @Test
        @WithAnonymousUser
        void unmappedRoute_shouldReturn403_whenAnonymous() throws Exception {
            // Falls through to .anyRequest().authenticated() since it matches
            // none of the explicit permitAll/hasRole rules above.
            MvcResult result = mockMvc.perform(get("/some-unmapped-route")).andReturn();
            assertForbidden(result);
        }

        @Test
        @WithMockUser(roles = "GUEST")
        void unmappedRoute_shouldBeAllowedPastSecurity_forAnyAuthenticatedRole() throws Exception {
            MvcResult result = mockMvc.perform(get("/some-unmapped-route")).andReturn();
            assertAllowedPastSecurity(result);
        }
    }
}