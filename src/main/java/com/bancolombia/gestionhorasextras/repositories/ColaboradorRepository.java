package com.bancolombia.gestionhorasextras.repositories;

import com.bancolombia.gestionhorasextras.models.Colaborador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ColaboradorRepository extends JpaRepository<Colaborador, Long> {

    // Buscar por código de ventas (único)
    Optional<Colaborador> findByCodigoVentas(String codigoVentas);

    // Buscar todos los colaboradores activos
    List<Colaborador> findByActivoTrue();

    // Buscar colaboradores por horario (para el filtro de sábados)
    List<Colaborador> findByHorario(String horario);

    // Buscar colaboradores por sucursal
    List<Colaborador> findBySucursal(String sucursal);

    // Buscar colaboradores activos por horario
    List<Colaborador> findByActivoTrueAndHorario(String horario);
}