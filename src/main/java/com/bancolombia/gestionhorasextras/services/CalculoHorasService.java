package com.bancolombia.gestionhorasextras.services;

import com.bancolombia.gestionhorasextras.models.Colaborador;
import com.bancolombia.gestionhorasextras.models.Novedad;
import com.bancolombia.gestionhorasextras.models.RegistroAsistencia;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CalculoHorasService {

    @Autowired
    private RegistroAsistenciaService registroAsistenciaService;

    @Autowired
    private NovedadService novedadService;

    @Autowired
    private ColaboradorService colaboradorService;

    /**
     * Calcula los minutos teóricos diarios de un colaborador
     */
    public int calcularMinutosTeoricosDiarios(Colaborador colaborador) {
        int horasSemanales = colaborador.getHorasSemanales();
        int diasSemana = colaborador.getHorario().equals("LUNES_VIERNES") ? 5 : 6;
        double horasDiarias = (double) horasSemanales / diasSemana;
        return (int) Math.round(horasDiarias * 60);
    }

    /**
     * Calcula el total de minutos trabajados en una semana para un colaborador
     */
    public int calcularMinutosTrabajadosSemana(Long colaboradorId, LocalDate fechaInicio, LocalDate fechaFin) {
        System.out.println("=== CALCULANDO MINUTOS TRABAJADOS ===");
        System.out.println("Colaborador ID: " + colaboradorId);
        System.out.println("Fecha Inicio: " + fechaInicio);
        System.out.println("Fecha Fin: " + fechaFin);
        
        Colaborador colaborador = colaboradorService.buscarPorId(colaboradorId).orElse(null);
        if (colaborador == null) {
            System.out.println("❌ Colaborador no encontrado");
            return 0;
        }
        System.out.println("✅ Colaborador: " + colaborador.getNombreCompleto());

        List<RegistroAsistencia> registros = registroAsistenciaService
                .listarPorColaboradorYSemana(colaboradorId, fechaInicio, fechaFin);
        
        System.out.println("📊 Registros encontrados: " + registros.size());
        for (RegistroAsistencia r : registros) {
            System.out.println("   - Fecha: " + r.getFecha() + ", Minutos: " + r.getMinutosTrabajados());
        }

        List<Novedad> novedades = novedadService.listarPorColaboradorYFecha(colaboradorId, fechaInicio, fechaFin);
        System.out.println("📋 Novedades encontradas: " + novedades.size());

        int minutosTeoricosDiarios = calcularMinutosTeoricosDiarios(colaborador);
        System.out.println("⏰ Minutos teóricos diarios: " + minutosTeoricosDiarios);

        int totalMinutos = 0;
        String horario = colaborador.getHorario();
        System.out.println("📅 Horario: " + horario);

        LocalDate fecha = fechaInicio;
        while (!fecha.isAfter(fechaFin)) {
            boolean esDiaLaboral = esDiaLaboral(fecha, horario);
            System.out.println("📆 " + fecha + " - ¿Día laboral? " + esDiaLaboral);
            
            if (esDiaLaboral) {
                final LocalDate fechaActual = fecha;
                final int minutosTeoricos = minutosTeoricosDiarios;

                RegistroAsistencia registro = registros.stream()
                        .filter(r -> r.getFecha().equals(fechaActual))
                        .findFirst()
                        .orElse(null);

                Novedad novedad = novedades.stream()
                        .filter(n -> !fechaActual.isBefore(n.getFechaInicio()) && !fechaActual.isAfter(n.getFechaFin()))
                        .findFirst()
                        .orElse(null);

                int minutosDia = 0;

                if (registro != null) {
                    minutosDia = registro.getMinutosTrabajados();
                    System.out.println("   ✅ Registro encontrado: " + minutosDia + " minutos");
                    if (novedad != null) {
                        minutosDia = Math.max(minutosDia, minutosTeoricos);
                        System.out.println("   🔄 Con novedad, ajustado a: " + minutosDia);
                    }
                } else if (novedad != null) {
                    minutosDia = minutosTeoricos;
                    System.out.println("   📋 Sin registro pero con novedad: " + minutosDia);
                } else {
                    System.out.println("   ❌ Sin registro y sin novedad: 0 minutos");
                }

                totalMinutos += minutosDia;
                System.out.println("   ➕ Total acumulado: " + totalMinutos);
            }

            fecha = fecha.plusDays(1);
        }

        System.out.println("🏁 TOTAL MINUTOS TRABAJADOS: " + totalMinutos);
        return totalMinutos;
    }

    /**
     * Calcula las horas extras de un colaborador en una semana
     * Retorna 0 si el resultado es negativo
     */
    public int calcularHorasExtras(Long colaboradorId, LocalDate fechaInicio, LocalDate fechaFin) {
        Colaborador colaborador = colaboradorService.buscarPorId(colaboradorId).orElse(null);
        if (colaborador == null) return 0;

        int horasTeoricasSemanales = colaborador.getHorasSemanales() * 60;
        int minutosTrabajados = calcularMinutosTrabajadosSemana(colaboradorId, fechaInicio, fechaFin);
        int resultado = minutosTrabajados - horasTeoricasSemanales;

        return Math.max(resultado, 0);
    }

    /**
     * Verifica si un día es laboral según el horario del colaborador
     */
    private boolean esDiaLaboral(LocalDate fecha, String horario) {
        int diaSemana = fecha.getDayOfWeek().getValue();
        
        if (horario.equals("LUNES_VIERNES")) {
            return diaSemana >= 1 && diaSemana <= 5;
        } else {
            return diaSemana >= 1 && diaSemana <= 6;
        }
    }
}