package com.bancolombia.gestionhorasextras.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "novedades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Novedad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "colaborador_id", nullable = false)
    private Colaborador colaborador;

    @Column(nullable = false)
    private String tipo;  // FESTIVO, PERMISO, PERMISO_MEDICO, CUMPLEAÑOS, VIERNES_FELIZ, CALAMIDAD, INCAPACIDAD

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column(nullable = false)
    private LocalDate fechaFin;

    private String descripcion;

    @Column(nullable = false)
    private Boolean aplicaJornadaCompleta = true;  // true = día completo, false = media jornada
}