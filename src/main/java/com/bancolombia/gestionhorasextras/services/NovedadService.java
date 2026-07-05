package com.bancolombia.gestionhorasextras.services;

import com.bancolombia.gestionhorasextras.models.Colaborador;
import com.bancolombia.gestionhorasextras.models.Novedad;
import com.bancolombia.gestionhorasextras.repositories.NovedadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class NovedadService {

    @Autowired
    private NovedadRepository novedadRepository;

    @Autowired
    private ColaboradorService colaboradorService;

    public Novedad guardar(Novedad novedad) {
        return novedadRepository.save(novedad);
    }

    public List<Novedad> guardarTodos(List<Novedad> novedades) {
        return novedadRepository.saveAll(novedades);
    }

    public List<Novedad> listarTodos() {
        return novedadRepository.findAll();
    }

    public List<Novedad> listarPorColaborador(Long colaboradorId) {
        return novedadRepository.findByColaboradorIdAndFechaBetween(colaboradorId, LocalDate.now());
    }

    public List<Novedad> listarActivasEnFecha(LocalDate fecha) {
        return novedadRepository.findByFecha(fecha);
    }

    public boolean existeNovedad(Long colaboradorId, LocalDate fecha) {
        return novedadRepository.existsByColaboradorIdAndFecha(colaboradorId, fecha);
    }

    public void eliminar(Long id) {
        novedadRepository.deleteById(id);
    }

    /**
     * Lista novedades de un colaborador en un rango de fechas
     */
    public List<Novedad> listarPorColaboradorYFecha(Long colaboradorId, LocalDate fechaInicio, LocalDate fechaFin) {
        return novedadRepository.findByColaboradorIdAndFechaRango(colaboradorId, fechaInicio, fechaFin);
    }

    // =============================================
    // MÉTODO BASE PARA CREAR NOVEDADES
    // =============================================

    /**
     * Crea novedades grupales (aplica a todos los colaboradores activos)
     */
    public List<Novedad> crearNovedadGrupal(String tipo, LocalDate fecha, String descripcion) {
        List<Colaborador> colaboradores = colaboradorService.listarActivos();
        List<Novedad> novedades = new ArrayList<>();

        for (Colaborador colaborador : colaboradores) {
            if (existeNovedad(colaborador.getId(), fecha)) {
                continue;
            }

            Novedad novedad = new Novedad();
            novedad.setColaborador(colaborador);
            novedad.setTipo(tipo);
            novedad.setFechaInicio(fecha);
            novedad.setFechaFin(fecha);
            novedad.setDescripcion(descripcion);
            novedad.setAplicaJornadaCompleta(true);

            novedades.add(novedad);
        }

        return guardarTodos(novedades);
    }

    /**
     * Crea novedades individuales (para un colaborador específico)
     */
    public Novedad crearNovedadIndividual(Long colaboradorId, String tipo, LocalDate fecha, String descripcion) {
        Colaborador colaborador = colaboradorService.buscarPorId(colaboradorId)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado"));

        if (existeNovedad(colaboradorId, fecha)) {
            throw new RuntimeException("El colaborador ya tiene una novedad para esta fecha");
        }

        Novedad novedad = new Novedad();
        novedad.setColaborador(colaborador);
        novedad.setTipo(tipo);
        novedad.setFechaInicio(fecha);
        novedad.setFechaFin(fecha);
        novedad.setDescripcion(descripcion);
        novedad.setAplicaJornadaCompleta(true);

        return guardar(novedad);
    }

    /**
     * Crea incapacidad (puede ser por rango de fechas)
     */
    public Novedad crearIncapacidad(Long colaboradorId, LocalDate fechaInicio, LocalDate fechaFin, String descripcion) {
        Colaborador colaborador = colaboradorService.buscarPorId(colaboradorId)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado"));

        Novedad novedad = new Novedad();
        novedad.setColaborador(colaborador);
        novedad.setTipo("INCAPACIDAD");
        novedad.setFechaInicio(fechaInicio);
        novedad.setFechaFin(fechaFin);
        novedad.setDescripcion(descripcion);
        novedad.setAplicaJornadaCompleta(true);

        return guardar(novedad);
    }

    /**
     * Crea novedades individuales con rango de fechas
     */
    public Novedad crearNovedadRango(Long colaboradorId, String tipo, LocalDate fechaInicio, LocalDate fechaFin, String descripcion) {
        Colaborador colaborador = colaboradorService.buscarPorId(colaboradorId)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado"));

        Novedad novedad = new Novedad();
        novedad.setColaborador(colaborador);
        novedad.setTipo(tipo);
        novedad.setFechaInicio(fechaInicio);
        novedad.setFechaFin(fechaFin);
        novedad.setDescripcion(descripcion);
        novedad.setAplicaJornadaCompleta(true);

        return guardar(novedad);
    }

    // =============================================
    // MÉTODOS ESPECÍFICOS POR TIPO
    // =============================================

    // GRUPALES
    public List<Novedad> crearFestivo(LocalDate fecha, String descripcion) {
        return crearNovedadGrupal("FESTIVO", fecha, descripcion);
    }

    public List<Novedad> crearViernesFeliz(LocalDate fecha, String descripcion) {
        return crearNovedadGrupal("VIERNES_FELIZ", fecha, descripcion);
    }

    // INDIVIDUALES (un día)
    public Novedad crearPermiso(Long colaboradorId, LocalDate fecha, String descripcion) {
        return crearNovedadIndividual(colaboradorId, "PERMISO", fecha, descripcion);
    }

    public Novedad crearPermisoMedico(Long colaboradorId, LocalDate fecha, String descripcion) {
        return crearNovedadIndividual(colaboradorId, "PERMISO_MEDICO", fecha, descripcion);
    }

    public Novedad crearCumpleanos(Long colaboradorId, LocalDate fecha, String descripcion) {
        return crearNovedadIndividual(colaboradorId, "CUMPLEAÑOS", fecha, descripcion);
    }

    public Novedad crearCalamidad(Long colaboradorId, LocalDate fecha, String descripcion) {
        return crearNovedadIndividual(colaboradorId, "CALAMIDAD", fecha, descripcion);
    }

    // INDIVIDUALES (rango)
    public Novedad crearCalamidadRango(Long colaboradorId, LocalDate fechaInicio, LocalDate fechaFin, String descripcion) {
        return crearNovedadRango(colaboradorId, "CALAMIDAD", fechaInicio, fechaFin, descripcion);
    }

    public Novedad crearIncapacidadRango(Long colaboradorId, LocalDate fechaInicio, LocalDate fechaFin, String descripcion) {
        return crearNovedadRango(colaboradorId, "INCAPACIDAD", fechaInicio, fechaFin, descripcion);
    }
}