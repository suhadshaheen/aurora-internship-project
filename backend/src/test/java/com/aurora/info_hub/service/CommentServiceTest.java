package com.aurora.info_hub.service;

import com.aurora.info_hub.dto.comment.CommentRequest;
import com.aurora.info_hub.dto.comment.CommentResponse;
import com.aurora.info_hub.dto.comment.CommentUpdateRequest;
import com.aurora.info_hub.entity.Comment;
import com.aurora.info_hub.entity.Section;
import com.aurora.info_hub.entity.User;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.repository.CommentRepository;
import com.aurora.info_hub.repository.SectionRepository;
import com.aurora.info_hub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SectionRepository sectionRepository;

    private CommentService commentService;

    private User owner;
    private User admin;
    private User stranger;
    private Section section;

    @BeforeEach
    void setUp() {
        commentService = new CommentService(commentRepository, userRepository, sectionRepository);

        owner = User.builder().id(1L).userHandle("owner").email("owner@example.com").role("EMPLOYEE").build();
        admin = User.builder().id(2L).userHandle("admin").email("admin@example.com").role("ADMIN").build();
        stranger = User.builder().id(3L).userHandle("stranger").email("stranger@example.com").role("EMPLOYEE").build();
        section = Section.builder().id(100L).build();
    }

    private Comment makeComment(Long id, User createdBy, Comment parent) {
        return Comment.builder()
                .id(id)
                .content("Some content")
                .createdBy(createdBy)
                .createdIn(section)
                .parentComment(parent)
                .children(List.of())
                .dateCreated(LocalDateTime.now())
                .build();
    }

    // Helper that mocks SecurityContextHolder for the duration of the given action.
    private void withCurrentUser(User user, Runnable action) {
        try (MockedStatic<SecurityContextHolder> mockedHolder = mockStatic(SecurityContextHolder.class)) {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            mockedHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn(user.getEmail());
            when(userRepository.findByEmailAndDeletedFalse(user.getEmail()))
                    .thenReturn(Optional.of(user));

            action.run();
        }
    }

    // ---------- getAllComments ----------

    @Test
    void getAllComments_shouldReturnOnlyRootComments_mappedWithNestedChildren() {
        Comment root = makeComment(1L, owner, null);
        Comment child = makeComment(2L, owner, root);
        root.setChildren(List.of(child));

        when(commentRepository.findByParentCommentIsNull()).thenReturn(List.of(root));

        List<CommentResponse> result = commentService.getAllComments();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getChildren()).hasSize(1);
        assertThat(result.get(0).getChildren().get(0).getId()).isEqualTo(2L);
    }

    @Test
    void getAllComments_shouldReturnEmptyList_whenNoComments() {
        when(commentRepository.findByParentCommentIsNull()).thenReturn(List.of());

        List<CommentResponse> result = commentService.getAllComments();

        assertThat(result).isEmpty();
    }

    @Test
    void getAllComments_shouldTreatNullChildren_asEmptyList() {
        Comment root = makeComment(1L, owner, null);
        root.setChildren(null);

        when(commentRepository.findByParentCommentIsNull()).thenReturn(List.of(root));

        List<CommentResponse> result = commentService.getAllComments();

        assertThat(result.get(0).getChildren()).isEmpty();
    }

    // ---------- getCommentsBySection ----------

    @Test
    void getCommentsBySection_shouldReturnFlatListWithoutNestedChildren() {
        Comment root = makeComment(1L, owner, null);
        Comment reply = makeComment(2L, owner, root);

        when(commentRepository.findByCreatedIn_Id(100L)).thenReturn(List.of(root, reply));

        List<CommentResponse> result = commentService.getCommentsBySection(100L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getChildren()).isEmpty();
        assertThat(result.get(1).getChildren()).isEmpty();
        assertThat(result.get(1).getParentCommentId()).isEqualTo(1L);
    }

    // ---------- getCommentById ----------

    @Test
    void getCommentById_shouldReturnResponse_whenCommentExists() {
        Comment comment = makeComment(1L, owner, null);
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        CommentResponse response = commentService.getCommentById(1L);

        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    void getCommentById_shouldThrowNotFound_whenCommentDoesNotExist() {
        when(commentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.getCommentById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Comment not found");
    }

    // ---------- createComment ----------

    @Test
    void createComment_shouldSaveTopLevelComment_whenNoParentGiven() {
        CommentRequest request = new CommentRequest();
        request.setContent("Hello");
        request.setSectionId(100L);
        request.setParentCommentId(null);

        when(sectionRepository.findById(100L)).thenReturn(Optional.of(section));
        when(commentRepository.save(any(Comment.class))).thenAnswer(inv -> {
            Comment c = inv.getArgument(0);
            c.setId(10L);
            c.setDateCreated(LocalDateTime.now());
            c.setChildren(List.of());
            return c;
        });

        withCurrentUser(owner, () -> {
            CommentResponse response = commentService.createComment(request);

            assertThat(response.getId()).isEqualTo(10L);
            assertThat(response.getParentCommentId()).isNull();
            assertThat(response.getCreatedById()).isEqualTo(owner.getId());
        });
    }

    @Test
    void createComment_shouldLinkParentComment_whenParentCommentIdGiven() {
        Comment parent = makeComment(5L, owner, null);
        CommentRequest request = new CommentRequest();
        request.setContent("A reply");
        request.setSectionId(100L);
        request.setParentCommentId(5L);

        when(sectionRepository.findById(100L)).thenReturn(Optional.of(section));
        when(commentRepository.findById(5L)).thenReturn(Optional.of(parent));

        ArgumentCaptor<Comment> captor = ArgumentCaptor.forClass(Comment.class);
        when(commentRepository.save(captor.capture())).thenAnswer(inv -> {
            Comment c = inv.getArgument(0);
            c.setId(11L);
            c.setChildren(List.of());
            return c;
        });

        withCurrentUser(owner, () -> commentService.createComment(request));

        assertThat(captor.getValue().getParentComment()).isEqualTo(parent);
    }

    @Test
    void createComment_shouldThrowNotFound_whenParentCommentDoesNotExist() {
        CommentRequest request = new CommentRequest();
        request.setContent("A reply");
        request.setSectionId(100L);
        request.setParentCommentId(999L);

        when(sectionRepository.findById(100L)).thenReturn(Optional.of(section));
        when(commentRepository.findById(999L)).thenReturn(Optional.empty());

        withCurrentUser(owner, () ->
                assertThatThrownBy(() -> commentService.createComment(request))
                        .isInstanceOf(NotFoundException.class)
                        .hasMessage("Parent comment not found"));
    }

    @Test
    void createComment_shouldThrowNotFound_whenSectionDoesNotExist() {
        CommentRequest request = new CommentRequest();
        request.setContent("Hello");
        request.setSectionId(999L);

        when(sectionRepository.findById(999L)).thenReturn(Optional.empty());

        withCurrentUser(owner, () ->
                assertThatThrownBy(() -> commentService.createComment(request))
                        .isInstanceOf(NotFoundException.class)
                        .hasMessage("Section not found"));
    }

    @Test
    void createComment_shouldThrowNotFound_whenCurrentUserDoesNotExist() {
        CommentRequest request = new CommentRequest();
        request.setContent("Hello");
        request.setSectionId(100L);

        try (MockedStatic<SecurityContextHolder> mockedHolder = mockStatic(SecurityContextHolder.class)) {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            mockedHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn("ghost@example.com");
            when(userRepository.findByEmailAndDeletedFalse("ghost@example.com"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> commentService.createComment(request))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessage("User not found");
        }
    }

    // ---------- updateComment ----------

    @Test
    void updateComment_shouldSucceed_whenCurrentUserIsOwner() {
        Comment comment = makeComment(1L, owner, null);
        CommentUpdateRequest request = new CommentUpdateRequest();
        request.setContent("Updated content");

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(inv -> inv.getArgument(0));

        withCurrentUser(owner, () -> {
            CommentResponse response = commentService.updateComment(1L, request);
            assertThat(response.getContent()).isEqualTo("Updated content");
        });
    }

    @Test
    void updateComment_shouldSucceed_whenCurrentUserIsAdminButNotOwner() {
        Comment comment = makeComment(1L, owner, null);
        CommentUpdateRequest request = new CommentUpdateRequest();
        request.setContent("Admin edited this");

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(inv -> inv.getArgument(0));

        withCurrentUser(admin, () -> {
            CommentResponse response = commentService.updateComment(1L, request);
            assertThat(response.getContent()).isEqualTo("Admin edited this");
        });
    }

    @Test
    void updateComment_shouldSucceed_whenAdminRoleIsLowercase() {
        User lowercaseAdmin = User.builder()
                .id(4L).userHandle("admin2").email("admin2@example.com").role("admin").build();
        Comment comment = makeComment(1L, owner, null);
        CommentUpdateRequest request = new CommentUpdateRequest();
        request.setContent("Edited by lowercase admin");

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(inv -> inv.getArgument(0));

        withCurrentUser(lowercaseAdmin, () -> {
            CommentResponse response = commentService.updateComment(1L, request);
            assertThat(response.getContent()).isEqualTo("Edited by lowercase admin");
        });
    }

    @Test
    void updateComment_shouldThrowAccessDenied_whenNeitherOwnerNorAdmin() {
        Comment comment = makeComment(1L, owner, null);
        CommentUpdateRequest request = new CommentUpdateRequest();
        request.setContent("Hacked!");

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        withCurrentUser(stranger, () ->
                assertThatThrownBy(() -> commentService.updateComment(1L, request))
                        .isInstanceOf(AccessDeniedException.class)
                        .hasMessageContaining("edit"));

        verify(commentRepository, never()).save(any());
    }

    @Test
    void updateComment_shouldThrowNotFound_whenCommentDoesNotExist() {
        CommentUpdateRequest request = new CommentUpdateRequest();
        request.setContent("x");

        when(commentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.updateComment(99L, request))
                .isInstanceOf(NotFoundException.class);
    }

    // ---------- deleteComment ----------

    @Test
    void deleteComment_shouldSucceed_whenCurrentUserIsOwner() {
        Comment comment = makeComment(1L, owner, null);
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        withCurrentUser(owner, () -> commentService.deleteComment(1L));

        verify(commentRepository).delete(comment);
    }

    @Test
    void deleteComment_shouldSucceed_whenCurrentUserIsAdminButNotOwner() {
        Comment comment = makeComment(1L, owner, null);
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        withCurrentUser(admin, () -> commentService.deleteComment(1L));

        verify(commentRepository).delete(comment);
    }

    @Test
    void deleteComment_shouldThrowAccessDenied_whenNeitherOwnerNorAdmin() {
        Comment comment = makeComment(1L, owner, null);
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        withCurrentUser(stranger, () ->
                assertThatThrownBy(() -> commentService.deleteComment(1L))
                        .isInstanceOf(AccessDeniedException.class)
                        .hasMessageContaining("delete"));

        verify(commentRepository, never()).delete(any(Comment.class));
    }

    @Test
    void deleteComment_shouldThrowNotFound_whenCommentDoesNotExist() {
        when(commentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.deleteComment(99L))
                .isInstanceOf(NotFoundException.class);
    }
}