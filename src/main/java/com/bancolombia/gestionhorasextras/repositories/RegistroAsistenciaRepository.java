package com.bancolombia.gestionhorasextras.repositories;

import com.bancolombia.gestionhorasextras.models.RegistroAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RegistroAsistenciaRepository extends JpaRepository<RegistroAsistencia, Long> {

    List<RegistroAsistencia> findByFecha(LocalDate fecha);

    List<RegistroAsistencia> findByColaboradorIdAndFecha(Long colaboradorId, LocalDate fecha);

    // Método con @Query explícita para evitar problemas de nomenclatura
    @Query("SELECT r FROM RegistroAsistencia r WHERE r.colaborador.id = :colaboradorId AND r.fecha BETWEEN :fechaInicio AND :fechaFin ORDER BY r.fecha ASC")
    List<RegistroAsistencia> findByColaboradorIdAndFechaBetween(
            @Param("colaboradorId") Long colaboradorId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );

    boolean existsByColaboradorIdAndFecha(Long colaboradorId, LocalDate fecha);
}