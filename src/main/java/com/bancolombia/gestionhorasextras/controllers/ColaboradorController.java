package com.bancolombia.gestionhorasextras.controllers;

import com.bancolombia.gestionhorasextras.models.Colaborador;
import com.bancolombia.gestionhorasextras.services.ColaboradorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/colaboradores")
@CrossOrigin(origins = "*") // Permite que el frontend se comunique desde cualquier origen
public class ColaboradorController {

    @Autowired
    private ColaboradorService colaboradorService;

    // ============ LISTAR TODOS ============
    @GetMapping
    public ResponseEntity<List<Colaborador>> listarTodos() {
        return ResponseEntity.ok(colaboradorService.listarTodos());
    }

    // ============ LISTAR ACTIVOS ============
    @GetMapping("/activos")
    public ResponseEntity<List<Colaborador>> listarActivos() {
        return ResponseEntity.ok(colaboradorService.listarActivos());
    }

    // ============ BUSCAR POR ID ============
    @GetMapping("/{id}")
    public ResponseEntity<Colaborador> buscarPorId(@PathVariable Long id) {
        Optional<Colaborador> colaborador = colaboradorService.buscarPorId(id);
        return colaborador.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ============ BUSCAR POR CÓDIGO DE VENTAS ============
    @GetMapping("/codigo/{codigoVentas}")
    public ResponseEntity<Colaborador> buscarPorCodigoVentas(@PathVariable String codigoVentas) {
        Optional<Colaborador> colaborador = colaboradorService.buscarPorCodigoVentas(codigoVentas);
        return colaborador.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ============ BUSCAR POR SUCURSAL ============
    @GetMapping("/sucursal/{sucursal}")
    public ResponseEntity<List<Colaborador>> buscarPorSucursal(@PathVariable String sucursal) {
        return ResponseEntity.ok(colaboradorService.buscarPorSucursal(sucursal));
    }

    // ============ BUSCAR POR HORARIO ============
    @GetMapping("/horario/{horario}")
    public ResponseEntity<List<Colaborador>> buscarPorHorario(@PathVariable String horario) {
        return ResponseEntity.ok(colaboradorService.buscarPorHorario(horario));
    }

    // ============ BUSCAR ACTIVOS POR HORARIO ============
    @GetMapping("/activos/horario/{horario}")
    public ResponseEntity<List<Colaborador>> buscarActivosPorHorario(@PathVariable String horario) {
        return ResponseEntity.ok(colaboradorService.buscarActivosPorHorario(horario));
    }

    // ============ CREAR NUEVO COLABORADOR ============
    @PostMapping
    public ResponseEntity<Colaborador> crear(@RequestBody Colaborador colaborador) {
        try {
            Colaborador nuevo = colaboradorService.guardar(colaborador);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ============ ACTUALIZAR COLABORADOR ============
    @PutMapping("/{id}")
    public ResponseEntity<Colaborador> actualizar(@PathVariable Long id, @RequestBody Colaborador colaborador) {
        try {
            // Verificar que existe
            Optional<Colaborador> existente = colaboradorService.buscarPorId(id);
            if (existente.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Mantener el mismo ID
            colaborador.setId(id);
            Colaborador actualizado = colaboradorService.guardar(colaborador);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ============ ACTIVAR COLABORADOR ============
    @PatchMapping("/{id}/activar")
    public ResponseEntity<Colaborador> activar(@PathVariable Long id) {
        try {
            Colaborador colaborador = colaboradorService.activar(id);
            return ResponseEntity.ok(colaborador);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ============ DESACTIVAR COLABORADOR ============
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Colaborador> desactivar(@PathVariable Long id) {
        try {
            Colaborador colaborador = colaboradorService.desactivar(id);
            return ResponseEntity.ok(colaborador);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ============ ELIMINAR COLABORADOR ============
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            colaboradorService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ============ CALCULAR MINUTOS META ============
    @GetMapping("/{id}/minutos-meta")
    public ResponseEntity<Integer> calcularMinutosMeta(@PathVariable Long id) {
        Optional<Colaborador> colaborador = colaboradorService.buscarPorId(id);
        if (colaborador.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        int minutosMeta = colaboradorService.calcularMinutosMeta(colaborador.get());
        return ResponseEntity.ok(minutosMeta);
    }
}