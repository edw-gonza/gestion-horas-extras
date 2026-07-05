package com.bancolombia.gestionhorasextras.services;

import com.bancolombia.gestionhorasextras.models.Colaborador;
import com.bancolombia.gestionhorasextras.repositories.ColaboradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ColaboradorService {

    @Autowired
    private ColaboradorRepository colaboradorRepository;

    // ============ CREAR / ACTUALIZAR ============

    public Colaborador guardar(Colaborador colaborador) {
        // Validar que no exista otro colaborador con el mismo código de ventas
        if (colaborador.getId() == null) {
            Optional<Colaborador> existente = colaboradorRepository.findByCodigoVentas(colaborador.getCodigoVentas());
            if (existente.isPresent()) {
                throw new RuntimeException("Ya existe un colaborador con el código de ventas: " + colaborador.getCodigoVentas());
            }
        }
        return colaboradorRepository.save(colaborador);
    }

    // ============ CONSULTAR ============

    public List<Colaborador> listarTodos() {
        return colaboradorRepository.findAll();
    }

    public List<Colaborador> listarActivos() {
        return colaboradorRepository.findByActivoTrue();
    }

    public Optional<Colaborador> buscarPorId(Long id) {
        return colaboradorRepository.findById(id);
    }

    public Optional<Colaborador> buscarPorCodigoVentas(String codigoVentas) {
        return colaboradorRepository.findByCodigoVentas(codigoVentas);
    }

    public List<Colaborador> buscarPorHorario(String horario) {
        return colaboradorRepository.findByHorario(horario);
    }

    public List<Colaborador> buscarActivosPorHorario(String horario) {
        return colaboradorRepository.findByActivoTrueAndHorario(horario);
    }

    public List<Colaborador> buscarPorSucursal(String sucursal) {
        return colaboradorRepository.findBySucursal(sucursal);
    }

    // ============ ACTUALIZAR ESTADO ============

    public Colaborador activar(Long id) {
        Colaborador colaborador = colaboradorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado con ID: " + id));
        colaborador.setActivo(true);
        return colaboradorRepository.save(colaborador);
    }

    public Colaborador desactivar(Long id) {
        Colaborador colaborador = colaboradorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado con ID: " + id));
        colaborador.setActivo(false);
        return colaboradorRepository.save(colaborador);
    }

    // ============ ELIMINAR ============

    public void eliminar(Long id) {
        if (!colaboradorRepository.existsById(id)) {
            throw new RuntimeException("Colaborador no encontrado con ID: " + id);
        }
        colaboradorRepository.deleteById(id);
    }

    // ============ MÉTODO ÚTIL PARA EL NEGOCIO ============

    /**
     * Calcula los minutos meta semanales del colaborador
     * Ej: si tiene 42 horas semanales, devuelve 2520 minutos
     */
    public int calcularMinutosMeta(Colaborador colaborador) {
        return colaborador.getHorasSemanales() * 60;
    }
}