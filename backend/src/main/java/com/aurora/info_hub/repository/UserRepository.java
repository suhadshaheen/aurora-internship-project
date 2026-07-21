package com.aurora.info_hub.repository;

import com.aurora.info_hub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}