package com.bancolombia.gestionhorasextras.repositories;

import com.bancolombia.gestionhorasextras.models.Novedad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface NovedadRepository extends JpaRepository<Novedad, Long> {

    // Buscar novedades por colaborador que estén activas en una fecha específica
    @Query("SELECT n FROM Novedad n WHERE n.colaborador.id = :colaboradorId AND :fecha BETWEEN n.fechaInicio AND n.fechaFin")
    List<Novedad> findByColaboradorIdAndFechaBetween(
            @Param("colaboradorId") Long colaboradorId,
            @Param("fecha") LocalDate fecha);

    // Buscar novedades por colaborador en un rango de fechas
    @Query("SELECT n FROM Novedad n WHERE n.colaborador.id = :colaboradorId AND n.fechaInicio >= :fechaInicio AND n.fechaFin <= :fechaFin")
    List<Novedad> findByColaboradorIdAndFechaRango(
            @Param("colaboradorId") Long colaboradorId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);

    // Verificar si existe una novedad para un colaborador en una fecha específica
    @Query("SELECT COUNT(n) > 0 FROM Novedad n WHERE n.colaborador.id = :colaboradorId AND :fecha BETWEEN n.fechaInicio AND n.fechaFin")
    boolean existsByColaboradorIdAndFecha(
            @Param("colaboradorId") Long colaboradorId,
            @Param("fecha") LocalDate fecha);

    // Buscar todas las novedades activas en una fecha específica
    @Query("SELECT n FROM Novedad n WHERE :fecha BETWEEN n.fechaInicio AND n.fechaFin")
    List<Novedad> findByFecha(
            @Param("fecha") LocalDate fecha);
}