package com.bancolombia.gestionhorasextras.services;

import com.bancolombia.gestionhorasextras.models.Colaborador;
import com.bancolombia.gestionhorasextras.models.RegistroAsistencia;
import com.bancolombia.gestionhorasextras.repositories.RegistroAsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class RegistroAsistenciaService {

    @Autowired
    private RegistroAsistenciaRepository registroAsistenciaRepository;

    public RegistroAsistencia guardar(RegistroAsistencia registro) {
        // Calcular minutos trabajados
        if (registro.getHoraEntrada() != null && registro.getHoraSalida() != null) {
            Duration duration = Duration.between(registro.getHoraEntrada(), registro.getHoraSalida());
            registro.setMinutosTrabajados((int) duration.toMinutes());
        } else {
            registro.setMinutosTrabajados(0);
        }
        return registroAsistenciaRepository.save(registro);
    }

    public List<RegistroAsistencia> listarPorFecha(LocalDate fecha) {
        return registroAsistenciaRepository.findByFecha(fecha);
    }

    public List<RegistroAsistencia> listarPorColaboradorYFecha(Long colaboradorId, LocalDate fecha) {
        return registroAsistenciaRepository.findByColaboradorIdAndFecha(colaboradorId, fecha);
    }

    public List<RegistroAsistencia> listarPorColaboradorYSemana(Long colaboradorId, LocalDate fechaInicio, LocalDate fechaFin) {
    // Asegurar que fechaInicio es antes que fechaFin
    if (fechaInicio.isAfter(fechaFin)) {
        LocalDate temp = fechaInicio;
        fechaInicio = fechaFin;
        fechaFin = temp;
    }
    return registroAsistenciaRepository.findByColaboradorIdAndFechaBetween(colaboradorId, fechaInicio, fechaFin);
}


    public boolean existeRegistro(Long colaboradorId, LocalDate fecha) {
        return registroAsistenciaRepository.existsByColaboradorIdAndFecha(colaboradorId, fecha);
    }

    public void eliminar(Long id) {
        registroAsistenciaRepository.deleteById(id);
    }

    public List<RegistroAsistencia> guardarTodos(List<RegistroAsistencia> registros) {
        // Calcular minutos trabajados para cada registro antes de guardar
        for (RegistroAsistencia registro : registros) {
            if (registro.getHoraEntrada() != null && registro.getHoraSalida() != null) {
                Duration duration = Duration.between(registro.getHoraEntrada(), registro.getHoraSalida());
                registro.setMinutosTrabajados((int) duration.toMinutes());
            } else {
                registro.setMinutosTrabajados(0);
            }
        }
        return registroAsistenciaRepository.saveAll(registros);
    }
}