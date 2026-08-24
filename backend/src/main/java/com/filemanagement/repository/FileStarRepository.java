package com.filemanagement.repository;

import com.filemanagement.entity.File;
import com.filemanagement.entity.FileStar;
import com.filemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FileStarRepository extends JpaRepository<FileStar, UUID> {

    Optional<FileStar> findByUserAndFile(User user, File file);

    List<FileStar> findByUser(User user);

    List<FileStar> findByFile(File file);
}
