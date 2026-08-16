# Product

## Register

product

## Users
Dos audiencias distintas usan esta app:
1. **Encuestadores/trabajadores sociales de campo** que completan la encuesta de evaluación de vulnerabilidad junto a la persona con discapacidad (o su cuidador). A menudo en el hogar del paciente, en un celular o tablet, con tiempo limitado. El formulario tiene 89 preguntas en 12 secciones -- la fatiga y la legibilidad importan mucho.
2. **Administradores/gestores de casos** que revisan el panel admin para priorizar a quién atender primero, ver el detalle de cada encuesta y exportar a Excel.

El sujeto de la encuesta es una persona con discapacidad (visual, auditiva, motora, intelectual) -- aunque no siempre sea quien complete el formulario, el diseño debe asumir usuarios con necesidades de accesibilidad reales, no solo cumplir WCAG por checklist.

## Product Purpose
Recopilar de forma sistemática la situación de salud, económica, de vivienda y de apoyo de personas con discapacidad, calcular un puntaje de vulnerabilidad configurable, y priorizar a quién asignar ayuda primero. Éxito = un encuestador completa la encuesta larga sin fatiga ni errores, y un admin identifica los casos más urgentes de un vistazo.

## Brand Personality
Cálida, humana, confiable. Nada de aspecto frío o burocrático/gubernamental -- debe sentirse respetuosa con las personas cuya situación vulnerable está siendo documentada, sin caer en tonos infantiles ni condescendientes.

## Anti-references
- El look "SaaS genérico de IA": tarjetas idénticas repetidas, gradientes decorativos, iconos flotantes tipo startup, eyebrows en mayúsculas sobre cada sección.
- Estética de formulario gubernamental frío (Times New Roman, tablas grises, cero jerarquía visual).
- Cualquier cosa que reduzca el contraste o el tamaño de texto "por elegancia" -- va en contra del propósito de la herramienta.

## Design Principles
1. **La accesibilidad no es un checklist, es el brief.** Contraste alto, texto grande, targets táctiles grandes, foco visible -- no como mínimo WCAG sino como decisión de diseño central.
2. **Reducir la fatiga de una encuesta larga.** Jerarquía clara de secciones, progreso visible, agrupación que ayude a orientarse en 89 preguntas.
3. **El panel admin prioriza escaneo rápido, no ornamentación.** Un gestor de casos debe identificar la urgencia de un caso en segundos.
4. **Cálido sin ser informal.** Color y tipografía humanizan la herramienta sin restarle seriedad al tema (vulnerabilidad, discapacidad, ingresos).
5. **Cambios quirúrgicos sobre el sistema existente.** Next.js + Tailwind ya está en uso; evolucionar la paleta/tipografía actual en vez de reescribir la arquitectura.

## Accessibility & Inclusion
- WCAG 2.1 AA como piso, apuntar a AAA en contraste de texto donde sea viable.
- Texto grande por defecto (ya usa text-lg en inputs), targets táctiles ≥44px.
- Soporte para prefers-reduced-motion en cualquier animación que se agregue.
- Mantener "Saltar al contenido principal" y estructura semántica (fieldset/legend, aria-live) ya presente en el código.
