package com.aurora.info_hub.service;

import com.aurora.info_hub.dto.section.SectionPatchRequest;
import com.aurora.info_hub.dto.section.SectionResponse;
import com.aurora.info_hub.entity.Category;
import com.aurora.info_hub.entity.Section;
import com.aurora.info_hub.entity.User;
import com.aurora.info_hub.exception.NotFoundException;
import com.aurora.info_hub.repository.CategoryRepository;
import com.aurora.info_hub.repository.SectionDocsRepository;
import com.aurora.info_hub.repository.SectionImageRepository;
import com.aurora.info_hub.repository.SectionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.access.AccessDeniedException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SectionServiceTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private SectionDocsRepository sectionDocsRepository;
    @Mock
    private SectionImageRepository sectionImageRepository;
    @Mock
    private FileStorageService fileStorageService;
    @Mock
    private SectionRepository sectionRepository;

    @InjectMocks
    private SectionService sectionService;

    private User employeeUser;
    private User adminUser;
    private Category category;

    @BeforeEach
    void setUp() {
        employeeUser = User.builder()
                .id(1L)
                .userHandle("suhad_sh")
                .role("EMPLOYEE")
                .build();

        adminUser = User.builder()
                .id(2L)
                .userHandle("admin_a")
                .role("ADMIN")
                .build();

        category = Category.builder()
                .id(10L)
                .catName("Networking")
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(User user) {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                user, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private void authenticateAsAnonymous() {
        Authentication auth = new AnonymousAuthenticationToken(
                "key", "anonymousUser", List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Section buildSection(Long id, User createdBy, Boolean visibility) {
        return Section.builder()
                .id(id)
                .title("Test Section")
                .content("Test content")
                .category(category)
                .createdBy(createdBy)
                .visibility(visibility)
                .important(false)
                .build();
    }

    @Test
    @DisplayName("test get sections when User Is Authenticated")
    void TestGetAllSections() {
        authenticateAs(employeeUser);
        Section visibleSection = buildSection(1L, employeeUser, true);
        Section hiddenSection = buildSection(2L, employeeUser, false);

        when(sectionRepository.findAllByOrderByImportantDescCreatedAtDesc()).thenReturn(List.of(visibleSection, hiddenSection));

        List<SectionResponse> result = sectionService.getAllSections();

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("test get sections when User Is Anonymous")
    void TestGetAllSectionsForAnonymous() {
        authenticateAsAnonymous();
        Section visibleSection = buildSection(1L, employeeUser, true);
        Section hiddenSection = buildSection(2L, employeeUser, false);

        when(sectionRepository.findAllByOrderByImportantDescCreatedAtDesc()).thenReturn(List.of(visibleSection, hiddenSection));

        List<SectionResponse> result = sectionService.getAllSections();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("test invalid get sections when No Sections Exist")
    void getAllSectionsWhenNoSectionsExist() {
        authenticateAs(employeeUser);
        when(sectionRepository.findAllByOrderByImportantDescCreatedAtDesc()).thenReturn(List.of());

        List<SectionResponse> result = sectionService.getAllSections();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("test valid get a section when the user Authenticated And the section is Visible")
    void getSectionByIdWhenAuthenticatedAndVisible() {
        authenticateAs(employeeUser);
        Section section = buildSection(1L, employeeUser, true);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

        SectionResponse response = sectionService.getSectionById(1L);

        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("test valid get a section When the user Authenticated And the section is Hidden")
    void getSectionByIdWhenAuthenticatedAndHidden() {
        authenticateAs(employeeUser);
        Section section = buildSection(1L, employeeUser, false);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

        SectionResponse response = sectionService.getSectionById(1L);

        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("test invalid get a section when the user Anonymous And the section is Hidden ")
    void getSectionById_shouldThrow_whenAnonymousAndSectionHidden() {
        authenticateAsAnonymous();
        Section section = buildSection(1L, employeeUser, false);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

        assertThatThrownBy(() -> sectionService.getSectionById(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Section Not Found");
    }

    @Test
    @DisplayName("test valid get a section when the user Anonymous And the section is Visible")
    void getSectionByIdWhenAnonymousAndVisible() {
        authenticateAsAnonymous();
        Section section = buildSection(1L, employeeUser, true);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

        SectionResponse response = sectionService.getSectionById(1L);

        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("test invalid get a section when Section Does Not Exist")
    void getSectionByIdWhenSectionDoesNotExist() {
        authenticateAs(employeeUser);
        when(sectionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sectionService.getSectionById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Section Not Found");
    }

    @Test
    @DisplayName("test invalid creation when Title Is Blank")
    void createSectionWhenTitleIsBlank() {
        assertThatThrownBy(() ->
                sectionService.createSection("", "content", 10L, true, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Title is required");
    }

    @Test
    @DisplayName("test invalid creation when Title Is Null")
    void createSectionWhenTitleIsNull() {
        assertThatThrownBy(() ->
                sectionService.createSection(null, "content", 10L, true, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Title is required");
    }

    @Test
    @DisplayName("test invalid creation when ContentIs Blank")
    void createSectionWhenContentIsBlank() {
        assertThatThrownBy(() ->
                sectionService.createSection("Title", "  ", 10L, true, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Content is required");
    }

    @Test
    @DisplayName("test invalid creation when Category Not Found")
    void createSectionWhenCategoryNotFound() {
        authenticateAs(employeeUser);
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                sectionService.createSection("Title", "Content", 99L, true, null, null))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Category Not Found!");
    }

    @Test
    @DisplayName("test valid creation When No Images Or Documents")
    void createSectionWhenNoImagesOrDocuments() {
        authenticateAs(employeeUser);
        Section savedSection = buildSection(1L, employeeUser, true);

        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(sectionRepository.save(any(Section.class))).thenReturn(savedSection);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(savedSection));

        SectionResponse response = sectionService.createSection("Title", "Content", 10L, true, null, null);

        assertThat(response.getId()).isEqualTo(1L);
        verify(sectionRepository).save(any(Section.class));
        verifyNoInteractions(fileStorageService);
    }

    @Test
    @DisplayName("test invalid creation when Visibility Is Null ")
    void createSectionWhenVisibilityIsNull() {
        authenticateAs(employeeUser);
        Section savedSection = buildSection(1L, employeeUser, true);

        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(sectionRepository.save(any(Section.class))).thenAnswer(inv -> {
            Section s = inv.getArgument(0);
            assertThat(s.getVisibility()).isTrue();
            return savedSection;
        });
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(savedSection));

        sectionService.createSection("Title", "Content", 10L, null, null, null);
    }
    @Test
    @DisplayName("test invalid creation when Image Type Not Allowed ")
    void createSectionWhenImageTypeNotAllowed() {
        authenticateAs(employeeUser);
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        Section savedSection = buildSection(1L, employeeUser, true);
        when(sectionRepository.save(any(Section.class))).thenReturn(savedSection);

        MultipartFile badImage = new MockMultipartFile(
                "image", "malware.exe", "application/octet-stream", "data".getBytes());

        assertThatThrownBy(() ->
                sectionService.createSection("Title", "Content", 10L, true, List.of(badImage), null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only JPEG, PNG and WEBP images are allowed");
    }
    @Test
    @DisplayName("test store valid images")
    void createSectionShouldStoreValidImage() {
        authenticateAs(employeeUser);
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        Section savedSection = buildSection(1L, employeeUser, true);
        when(sectionRepository.save(any(Section.class))).thenReturn(savedSection);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(savedSection));
        when(fileStorageService.storeFile(any())).thenReturn("http://files/image.jpg");

        MultipartFile validImage = new MockMultipartFile(
                "image", "photo.jpg", "image/jpeg", "data".getBytes());

        sectionService.createSection("Title", "Content", 10L, true, List.of(validImage), null);

        verify(sectionImageRepository).save(any());
        verify(fileStorageService).storeFile(validImage);
    }
    @Test
    @DisplayName("test invalid creation when Document Type Not Allowed")
    void createSectionWhenDocumentTypeNotAllowed() {
        authenticateAs(employeeUser);
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        Section savedSection = buildSection(1L, employeeUser, true);
        when(sectionRepository.save(any(Section.class))).thenReturn(savedSection);

        MultipartFile badDoc = new MockMultipartFile(
                "doc", "virus.exe", "application/octet-stream", "data".getBytes());

        assertThatThrownBy(() ->
                sectionService.createSection("Title", "Content", 10L, true, null, List.of(badDoc)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported document type");
    }
    @Test
    @DisplayName("test store valid docs")
    void createSectionShouldStoreValidDocument() {
        authenticateAs(employeeUser);
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        Section savedSection = buildSection(1L, employeeUser, true);
        when(sectionRepository.save(any(Section.class))).thenReturn(savedSection);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(savedSection));
        when(fileStorageService.storeFile(any())).thenReturn("http://files/doc.pdf");

        MultipartFile validDoc = new MockMultipartFile(
                "doc", "report.pdf", "application/pdf", "data".getBytes());

        sectionService.createSection("Title", "Content", 10L, true, null, List.of(validDoc));

        verify(sectionDocsRepository).save(any());
    }
    @Test
    @DisplayName("Test invalid update section When Title Is Blank")
    void updateSectionWhenTitleIsBlank() {
        assertThatThrownBy(() ->
                sectionService.updateSection(1L, "", "content", 10L, true, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Title is required");
    }

    @Test
    @DisplayName("test invalid update section when Section Not Found")
    void updateSectionWhenSectionNotFound() {
        when(sectionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                sectionService.updateSection(99L, "Title", "Content", 10L, true, null))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Section Not Found");
    }
    @Test
    @DisplayName("test invalid when Non Owner Non Admin Tries To Edit")
    void updateSectionWhenNonOwnerNonAdminTriesToEdit() {
        authenticateAs(employeeUser);
        User otherUser = User.builder().id(999L).role("EMPLOYEE").build();
        Section section = buildSection(1L, otherUser, true);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

        assertThatThrownBy(() ->
                sectionService.updateSection(1L, "Title", "Content", 10L, true, null))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("edit");
    }
    @Test
    @DisplayName("test valid update when Owner Edits")
    void updateSectionWhenOwnerEdits() {
        authenticateAs(employeeUser);
        Section section = buildSection(1L, employeeUser, true);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(sectionRepository.save(any(Section.class))).thenReturn(section);

        SectionResponse response = sectionService.updateSection(
                1L, "New Title", "New Content", 10L, true, null);

        assertThat(response.getTitle()).isEqualTo("New Title");
    }
    @Test
    @DisplayName("test valid update when Admin Edits Others Section")
    void updateSectionWhenAdminEditsOthersSection() {
        authenticateAs(adminUser);
        Section section = buildSection(1L, employeeUser, true);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(sectionRepository.save(any(Section.class))).thenReturn(section);

        SectionResponse response = sectionService.updateSection(
                1L, "New Title", "New Content", 10L, true, null);

        assertThat(response.getTitle()).isEqualTo("New Title");
    }
    @Test
    @DisplayName("test invalid update When Category Not Found")
    void updateSectionWhenCategoryNotFound() {
        authenticateAs(employeeUser);
        Section section = buildSection(1L, employeeUser, true);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                sectionService.updateSection(1L, "Title", "Content", 99L, true, null))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Category Not Found!");
    }
    @Test
    @DisplayName("test valid delete whenOwner Deletes ")
    void deleteSectionWhenOwnerDeletes() {
        authenticateAs(employeeUser);
        Section section = buildSection(1L, employeeUser, true);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

        sectionService.deleteSection(1L);

        verify(sectionRepository).deleteById(1L);
    }

    @Test
    @DisplayName("test invalid delete When Non Owner Non Admin Deletes")
    void deleteSectionWhenNonOwnerNonAdminDeletes() {
        authenticateAs(employeeUser);
        User otherUser = User.builder().id(999L).role("EMPLOYEE").build();
        Section section = buildSection(1L, otherUser, true);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

        assertThatThrownBy(() -> sectionService.deleteSection(1L))
                .isInstanceOf(AccessDeniedException.class);

        verify(sectionRepository, never()).deleteById(any());
    }
    @Test
    @DisplayName("test valid delete When Admin Deletes Others Section ")
    void deleteSectionWhenAdminDeletesOthersSection() {
        authenticateAs(adminUser);
        Section section = buildSection(1L, employeeUser, true);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

        sectionService.deleteSection(1L);

        verify(sectionRepository).deleteById(1L);
    }
    @Test
    @DisplayName("test invalid delete when Section Not Found")
    void deleteSectionWhenSectionNotFound() {
        when(sectionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sectionService.deleteSection(99L))
                .isInstanceOf(NotFoundException.class);
    }
    @Test
    @DisplayName("test vaLid update specific thing in a section ")
    void patchSectionUpdateOnlyProvidedFields() {
        authenticateAs(employeeUser);
        Section section = buildSection(1L, employeeUser, true);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));
        when(sectionRepository.save(any(Section.class))).thenReturn(section);

        SectionPatchRequest request = new SectionPatchRequest();
        request.setTitle("Patched Title");

        SectionResponse response = sectionService.patchSection(1L, request);

        assertThat(response.getTitle()).isEqualTo("Patched Title");
        assertThat(response.getContent()).isEqualTo("Test content");
    }
    @Test
    @DisplayName("test update only the category When Category Id Provided")
    void patchSectionWhenCategoryIdProvided() {
        authenticateAs(employeeUser);
        Section section = buildSection(1L, employeeUser, true);
        Category newCategory = Category.builder().id(20L).catName("DevOps").build();

        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));
        when(categoryRepository.findById(20L)).thenReturn(Optional.of(newCategory));
        when(sectionRepository.save(any(Section.class))).thenReturn(section);

        SectionPatchRequest request = new SectionPatchRequest();
        request.setCategoryId(20L);

        SectionResponse response = sectionService.patchSection(1L, request);

        assertThat(response.getCategory().getCatName()).isEqualTo("DevOps");
    }
    @Test
    @DisplayName("test invalid patch section when Non Owner Patches")
    void patchSectionWhenNonOwnerPatches() {
        authenticateAs(employeeUser);
        User otherUser = User.builder().id(999L).role("EMPLOYEE").build();
        Section section = buildSection(1L, otherUser, true);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

        SectionPatchRequest request = new SectionPatchRequest();
        request.setTitle("Hacked Title");

        assertThatThrownBy(() -> sectionService.patchSection(1L, request))
                .isInstanceOf(AccessDeniedException.class);
    }
    @Test
    @DisplayName("test invalid patch section When Section Not Found")
    void patchSectionWhenSectionNotFound() {
        when(sectionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sectionService.patchSection(99L, new SectionPatchRequest()))
                .isInstanceOf(NotFoundException.class);
    }
    @Test
    @DisplayName("test invalid delete  a doc when Section Not Found ")
    void deleteSectionDocumentWhenSectionNotFound() {
        when(sectionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sectionService.deleteSectionDocument(1L, 5L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Section Not Found");
    }
    @Test
    @DisplayName("Test valid get section by a specific category ")
    void getSectionsByCategory() {
        Section section = buildSection(1L, employeeUser, true);
        when(sectionRepository.findByCategoryIdOrderByImportantDescCreatedAtDesc(10L))
                .thenReturn(List.of(section));

        List<SectionResponse> result = sectionService.getSectionsByCategory(10L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("test invalid get section by a specific category when No Matches")
    void getSectionsByCategoryWhenNoMatches() {
        when(sectionRepository.findByCategoryIdOrderByImportantDescCreatedAtDesc(999L)).thenReturn(List.of());

        List<SectionResponse> result = sectionService.getSectionsByCategory(999L);

        assertThat(result).isEmpty();
    }





}