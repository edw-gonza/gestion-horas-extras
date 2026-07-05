package com.bancolombia.gestionhorasextras.controllers;

import com.bancolombia.gestionhorasextras.services.CalculoHorasService;
import com.bancolombia.gestionhorasextras.services.ColaboradorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/calculo")
@CrossOrigin(origins = "*")
public class CalculoHorasController {

    @Autowired
    private CalculoHorasService calculoHorasService;

    @Autowired
    private ColaboradorService colaboradorService;

    @GetMapping("/colaborador/{colaboradorId}/semana")
    public ResponseEntity<Map<String, Object>> calcularHorasExtras(
            @PathVariable Long colaboradorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fechaFin) {

        var colaborador = colaboradorService.buscarPorId(colaboradorId);
        if (colaborador.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Calcular minutos trabajados en la semana
        int minutosTrabajados = calculoHorasService.calcularMinutosTrabajadosSemana(colaboradorId, fechaInicio, fechaFin);
        
        // Calcular horas teóricas semanales en minutos
        int horasTeoricasSemanales = colaborador.get().getHorasSemanales() * 60;
        
        // Calcular horas extras (0 si es negativo)
        int horasExtrasMinutos = calculoHorasService.calcularHorasExtras(colaboradorId, fechaInicio, fechaFin);
        
        // Calcular saldo real (puede ser negativo)
        int saldoReal = minutosTrabajados - horasTeoricasSemanales;

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("colaboradorId", colaboradorId);
        resultado.put("colaboradorNombre", colaborador.get().getNombreCompleto());
        resultado.put("fechaInicio", fechaInicio);
        resultado.put("fechaFin", fechaFin);
        resultado.put("horasSemanales", colaborador.get().getHorasSemanales());
        resultado.put("horario", colaborador.get().getHorario());
        resultado.put("horasTeoricasMinutos", horasTeoricasSemanales);
        resultado.put("minutosTrabajados", minutosTrabajados);
        resultado.put("minutosTrabajadosHoras", String.format("%.2f", minutosTrabajados / 60.0));
        resultado.put("saldoRealMinutos", saldoReal);
        resultado.put("saldoRealHoras", String.format("%.2f", saldoReal / 60.0));
        resultado.put("horasExtrasMinutos", horasExtrasMinutos);
        resultado.put("horasExtrasHoras", String.format("%.2f", horasExtrasMinutos / 60.0));

        return ResponseEntity.ok(resultado);
    }
}