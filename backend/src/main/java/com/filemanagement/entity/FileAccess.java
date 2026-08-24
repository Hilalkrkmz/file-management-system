package com.filemanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "file_accesses", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "file_id"}))
@Getter
@Setter
@NoArgsConstructor
public class FileAccess {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "file_id", nullable = false)
    private File file;

    @Column(nullable = false)
    private LocalDateTime accessedAt;
}
