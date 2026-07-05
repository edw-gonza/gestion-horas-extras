package com.bancolombia.gestionhorasextras.controllers;

import com.bancolombia.gestionhorasextras.models.Colaborador;
import com.bancolombia.gestionhorasextras.models.RegistroAsistencia;
import com.bancolombia.gestionhorasextras.services.ColaboradorService;
import com.bancolombia.gestionhorasextras.services.RegistroAsistenciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/asistencia")
@CrossOrigin(origins = "*")
public class RegistroAsistenciaController {

    @Autowired
    private RegistroAsistenciaService registroAsistenciaService;

    @Autowired
    private ColaboradorService colaboradorService;

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<RegistroAsistencia>> listarPorFecha(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fecha) {
        return ResponseEntity.ok(registroAsistenciaService.listarPorFecha(fecha));
    }

    @GetMapping("/colaborador/{colaboradorId}/fecha/{fecha}")
    public ResponseEntity<List<RegistroAsistencia>> listarPorColaboradorYFecha(
            @PathVariable Long colaboradorId,
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fecha) {
        return ResponseEntity.ok(registroAsistenciaService.listarPorColaboradorYFecha(colaboradorId, fecha));
    }

    @GetMapping("/colaborador/{colaboradorId}/semana/{fechaInicio}/{fechaFin}")
    public ResponseEntity<List<RegistroAsistencia>> listarPorColaboradorYSemana(
            @PathVariable Long colaboradorId,
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fechaInicio,
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fechaFin) {
        return ResponseEntity.ok(registroAsistenciaService.listarPorColaboradorYSemana(colaboradorId, fechaInicio, fechaFin));
    }

    @PostMapping("/marcacion-masiva")
    public ResponseEntity<List<RegistroAsistencia>> crearMarcacionMasiva(
            @RequestParam List<Long> colaboradorIds,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fecha,
            @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime horaEntrada,
            @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime horaSalida) {

        List<RegistroAsistencia> registros = new ArrayList<>();

        for (Long colaboradorId : colaboradorIds) {
            // Verificar si ya existe registro para ese día
            if (registroAsistenciaService.existeRegistro(colaboradorId, fecha)) {
                continue;
            }

            Colaborador colaborador = colaboradorService.buscarPorId(colaboradorId).orElse(null);
            if (colaborador == null) continue;

            RegistroAsistencia registro = new RegistroAsistencia();
            registro.setColaborador(colaborador);
            registro.setFecha(fecha);
            registro.setHoraEntrada(horaEntrada);
            registro.setHoraSalida(horaSalida);

            registros.add(registro);
        }

        List<RegistroAsistencia> guardados = registroAsistenciaService.guardarTodos(registros);
        return ResponseEntity.ok(guardados);
    }

    @PostMapping
    public ResponseEntity<RegistroAsistencia> crearRegistro(@RequestBody RegistroAsistencia registro) {
        return ResponseEntity.ok(registroAsistenciaService.guardar(registro));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        registroAsistenciaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}