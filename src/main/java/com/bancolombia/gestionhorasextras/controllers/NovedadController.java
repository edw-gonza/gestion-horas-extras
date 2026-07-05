package com.bancolombia.gestionhorasextras.controllers;

import com.bancolombia.gestionhorasextras.models.Novedad;
import com.bancolombia.gestionhorasextras.services.NovedadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/novedades")
@CrossOrigin(origins = "*")
public class NovedadController {

    @Autowired
    private NovedadService novedadService;

    // =============================================
    // CONSULTAS
    // =============================================

    @GetMapping
    public ResponseEntity<List<Novedad>> listarTodos() {
        return ResponseEntity.ok(novedadService.listarTodos());
    }

    @GetMapping("/colaborador/{colaboradorId}")
    public ResponseEntity<List<Novedad>> listarPorColaborador(@PathVariable Long colaboradorId) {
        return ResponseEntity.ok(novedadService.listarPorColaborador(colaboradorId));
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<Novedad>> listarActivasEnFecha(@PathVariable String fecha) {
        LocalDate date = LocalDate.parse(fecha);
        return ResponseEntity.ok(novedadService.listarActivasEnFecha(date));
    }

    // =============================================
    // CREAR NOVEDAD GRUPAL - FESTIVO
    // =============================================

    @PostMapping("/festivo")
    public ResponseEntity<List<Novedad>> crearFestivo(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fecha,
            @RequestParam(required = false) String descripcion) {
        String desc = descripcion != null ? descripcion : "Día festivo nacional";
        return ResponseEntity.ok(novedadService.crearFestivo(fecha, desc));
    }

    // =============================================
    // CREAR NOVEDAD GRUPAL - VIERNES FELIZ
    // =============================================

    @PostMapping("/viernes-feliz")
    public ResponseEntity<List<Novedad>> crearViernesFeliz(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fecha,
            @RequestParam(required = false) String descripcion) {
        String desc = descripcion != null ? descripcion : "Viernes Feliz";
        return ResponseEntity.ok(novedadService.crearViernesFeliz(fecha, desc));
    }

    // =============================================
    // CREAR NOVEDAD INDIVIDUAL
    // =============================================

    @PostMapping("/permiso")
    public ResponseEntity<Novedad> crearPermiso(
            @RequestParam Long colaboradorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fecha,
            @RequestParam(required = false) String descripcion) {
        String desc = descripcion != null ? descripcion : "Permiso autorizado";
        return ResponseEntity.ok(novedadService.crearPermiso(colaboradorId, fecha, desc));
    }

    @PostMapping("/permiso-medico")
    public ResponseEntity<Novedad> crearPermisoMedico(
            @RequestParam Long colaboradorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fecha,
            @RequestParam(required = false) String descripcion) {
        String desc = descripcion != null ? descripcion : "Permiso médico";
        return ResponseEntity.ok(novedadService.crearPermisoMedico(colaboradorId, fecha, desc));
    }

    @PostMapping("/cumpleanos")
    public ResponseEntity<Novedad> crearCumpleanos(
            @RequestParam Long colaboradorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fecha,
            @RequestParam(required = false) String descripcion) {
        String desc = descripcion != null ? descripcion : "Cumpleaños";
        return ResponseEntity.ok(novedadService.crearCumpleanos(colaboradorId, fecha, desc));
    }

    @PostMapping("/calamidad")
    public ResponseEntity<Novedad> crearCalamidad(
            @RequestParam Long colaboradorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fecha,
            @RequestParam(required = false) String descripcion) {
        String desc = descripcion != null ? descripcion : "Calamidad doméstica";
        return ResponseEntity.ok(novedadService.crearCalamidad(colaboradorId, fecha, desc));
    }

    @PostMapping("/incapacidad")
    public ResponseEntity<Novedad> crearIncapacidad(
            @RequestParam Long colaboradorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fechaFin,
            @RequestParam(required = false) String descripcion) {
        String desc = descripcion != null ? descripcion : "Incapacidad médica";
        return ResponseEntity.ok(novedadService.crearIncapacidad(colaboradorId, fechaInicio, fechaFin, desc));
    }

    // =============================================
    // ELIMINAR NOVEDAD
    // =============================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        novedadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}