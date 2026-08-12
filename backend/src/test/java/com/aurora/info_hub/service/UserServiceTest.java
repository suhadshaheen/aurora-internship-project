package com.aurora.info_hub.service;

import com.aurora.info_hub.dto.user.UserRequest;
import com.aurora.info_hub.dto.user.UserResponse;
import com.aurora.info_hub.entity.User;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        userService = new UserService(passwordEncoder, userRepository);

        sampleUser = User.builder()
                .id(1L)
                .userHandle("john")
                .email("john@example.com")
                .password("encoded-pass")
                .role("EMPLOYEE")
                .deleted(false)
                .build();
    }

    // ---------- getAllUsers ----------

    @Test
    void getAllUsers_shouldReturnMappedResponses() {
        User user2 = User.builder()
                .id(2L).userHandle("jane").email("jane@example.com")
                .password("x").role("ADMIN").deleted(false).build();

        when(userRepository.findAll()).thenReturn(List.of(sampleUser, user2));

        List<UserResponse> result = userService.getAllUsers();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getEmail()).isEqualTo("john@example.com");
        assertThat(result.get(1).getRole()).isEqualTo("ADMIN");
    }

    @Test
    void getAllUsers_shouldReturnEmptyList_whenNoUsers() {
        when(userRepository.findAll()).thenReturn(List.of());

        List<UserResponse> result = userService.getAllUsers();

        assertThat(result).isEmpty();
    }

    // ---------- getUserById ----------

    @Test
    void getUserById_shouldReturnResponse_whenUserExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        UserResponse response = userService.getUserById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("john@example.com");
    }

    @Test
    void getUserById_shouldThrowNotFound_whenUserDoesNotExist() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("User not found");
    }

    // ---------- createUser ----------

    @Test
    void createUser_shouldEncodePasswordAndSaveWithGivenRole() {
        UserRequest request = UserRequest.builder()
                .userHandle("newuser")
                .email("new@example.com")
                .password("plainPass")
                .role("ADMIN")
                .build();

        when(passwordEncoder.encode("plainPass")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10L);
            return u;
        });

        UserResponse response = userService.createUser(request);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getRole()).isEqualTo("ADMIN");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("encodedPass");
    }

    @Test
    void createUser_shouldDefaultToEmployee_whenRoleIsNull() {
        UserRequest request = UserRequest.builder()
                .userHandle("newuser")
                .email("new@example.com")
                .password("plainPass")
                .role(null)
                .build();

        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.createUser(request);

        assertThat(response.getRole()).isEqualTo("EMPLOYEE");
    }

    @Test
    void createUser_shouldNormalizeLowercaseRole() {
        UserRequest request = UserRequest.builder()
                .userHandle("newuser")
                .email("new@example.com")
                .password("plainPass")
                .role("admin")
                .build();

        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.createUser(request);

        assertThat(response.getRole()).isEqualTo("ADMIN");
    }

    @Test
    void createUser_shouldThrowIllegalArgument_whenRoleIsInvalid() {
        UserRequest request = UserRequest.builder()
                .userHandle("newuser")
                .email("new@example.com")
                .password("plainPass")
                .role("HACKER")
                .build();

        assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid role");

        verifyNoInteractions(userRepository);
    }

    // ---------- updateUser ----------

    @Test
    void updateUser_shouldUpdateHandleAndEmail_withoutTouchingPassword_whenPasswordBlank() {
        UserRequest request = UserRequest.builder()
                .userHandle("updatedHandle")
                .email("updated@example.com")
                .password("")
                .role(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.updateUser(1L, request);

        assertThat(response.getUserHandle()).isEqualTo("updatedHandle");
        assertThat(response.getEmail()).isEqualTo("updated@example.com");
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void updateUser_shouldEncodeNewPassword_whenProvided() {
        UserRequest request = UserRequest.builder()
                .userHandle("john")
                .email("john@example.com")
                .password("newPlainPass")
                .role(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.encode("newPlainPass")).thenReturn("newEncodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.updateUser(1L, request);

        verify(passwordEncoder).encode("newPlainPass");
    }

    @Test
    void updateUser_shouldUpdateRole_whenProvided() {
        UserRequest request = UserRequest.builder()
                .userHandle("john")
                .email("john@example.com")
                .password(null)
                .role("guest")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.updateUser(1L, request);

        assertThat(response.getRole()).isEqualTo("GUEST");
    }

    @Test
    void updateUser_shouldThrowNotFound_whenUserDoesNotExist() {
        UserRequest request = UserRequest.builder()
                .userHandle("x").email("x@example.com").password("x").build();

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUser(99L, request))
                .isInstanceOf(NotFoundException.class);
    }

    // ---------- deleteUser ----------

    @Test
    void deleteUser_shouldSoftDeleteTargetUser() {
        User currentUser = User.builder().id(2L).email("admin@example.com").deleted(false).build();
        User targetUser = User.builder().id(1L).email("john@example.com").deleted(false).build();

        when(userRepository.findByEmailAndDeletedFalse("admin@example.com"))
                .thenReturn(Optional.of(currentUser));
        when(userRepository.findById(1L)).thenReturn(Optional.of(targetUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        try (MockedStatic<SecurityContextHolder> mockedHolder = mockStatic(SecurityContextHolder.class)) {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            mockedHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("admin@example.com");

            userService.deleteUser(1L);
        }

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().isDeleted()).isTrue();
    }

    @Test
    void deleteUser_shouldThrowIllegalArgument_whenDeletingSelf() {
        User currentUser = User.builder().id(1L).email("admin@example.com").deleted(false).build();

        when(userRepository.findByEmailAndDeletedFalse("admin@example.com"))
                .thenReturn(Optional.of(currentUser));

        try (MockedStatic<SecurityContextHolder> mockedHolder = mockStatic(SecurityContextHolder.class)) {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            mockedHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("admin@example.com");

            assertThatThrownBy(() -> userService.deleteUser(1L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("cannot delete your own account");
        }

        verify(userRepository, never()).save(any());
    }

    @Test
    void deleteUser_shouldThrowNotFound_whenCurrentUserNotFound() {
        when(userRepository.findByEmailAndDeletedFalse("ghost@example.com"))
                .thenReturn(Optional.empty());

        try (MockedStatic<SecurityContextHolder> mockedHolder = mockStatic(SecurityContextHolder.class)) {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            mockedHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("ghost@example.com");

            assertThatThrownBy(() -> userService.deleteUser(1L))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessage("Current user not found");
        }
    }

    @Test
    void deleteUser_shouldThrowNotFound_whenTargetUserNotFound() {
        User currentUser = User.builder().id(2L).email("admin@example.com").deleted(false).build();

        when(userRepository.findByEmailAndDeletedFalse("admin@example.com"))
                .thenReturn(Optional.of(currentUser));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        try (MockedStatic<SecurityContextHolder> mockedHolder = mockStatic(SecurityContextHolder.class)) {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            mockedHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("admin@example.com");

            assertThatThrownBy(() -> userService.deleteUser(99L))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessage("User not found");
        }
    }
}