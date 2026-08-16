-- Deleting a section should delete its comments instead of failing with a
-- foreign key violation.
ALTER TABLE comments DROP CONSTRAINT comments_section_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_section_id_fkey
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;
