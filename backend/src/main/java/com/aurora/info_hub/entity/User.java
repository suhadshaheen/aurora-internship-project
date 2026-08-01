package com.aurora.info_hub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.List;
import java.util.Collection;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User implements UserDetails{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    String userHandle;
    @Column(nullable = false)
    String password;
    @Column(nullable = false, unique = true)
    String email;
    String role;
    @OneToMany(mappedBy = "createdBy")
    private List<Section> sections;
    @OneToMany(mappedBy = "createdBy")
    private List<Category>  categories;
    @OneToMany(mappedBy = "createdBy")
    private List<Comment> comments;
    @Override
        public Collection<? extends GrantedAuthority> getAuthorities(){ 
            return List.of( new SimpleGrantedAuthority("ROLE_"+role) ); }
    @Override
        public String getUsername(){
            return email;
    }
    @Override
        public boolean isAccountNonExpired(){
            return true; } 
    @Override
        public boolean isAccountNonLocked(){
            return true; } 
    @Override
        public boolean isCredentialsNonExpired(){ 
            return true; } 
    @Override
        public boolean isEnabled(){ 
            return true; }

}
