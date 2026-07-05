package com.bancolombia.gestionhorasextras.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "colaboradores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Colaborador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String codigoVentas;        // Código único del asesor

    @Column(nullable = false, length = 100)
    private String nombreCompleto;

    @Column(unique = true, nullable = false, length = 100)
    private String correo;

    @Column(nullable = false)
    private LocalDate fechaNacimiento;

    @Column(nullable = false, length = 20)
    private String rol;                 // SERVICIO o ASESORIA

    @Column(nullable = false)
    private Integer horasSemanales;      // Ej: 42, 43, 48

    @Column(nullable = false, length = 20)
    private String horario;             // LUNES_VIERNES o LUNES_SABADO

    @Column(nullable = false)
    private String horaEntradaEstandar;  // "08:00"

    @Column(nullable = false)
    private String horaSalidaEstandar;   // "17:00"

    @Column(nullable = false)
    private Boolean activo = true;       // true = activo, false = inactivo

    @Column(nullable = false)
    private String sucursal;             // Nombre de la oficina
}