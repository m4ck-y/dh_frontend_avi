# Expansión Vertical del Visualizador Acústico y Superposición Suave de Capas

Eliminación de cortes en la animación de sonido (especialmente en modo Orbe y Espectro) mediante la ampliación de altura del lienzo a 140px, aplicación de máscara de desvanecimiento suave en los cuatro bordes (lateral y vertical), manteniendo el botón del micrófono en su posición inferior habitual con superposición de capas en el margen inferior para que las ondas expansivas se disuelvan con naturalidad.

## Decisiones Críticas y Revisión del Usuario

> [!IMPORTANT]
> Ajuste de diseño confirmado por el usuario:

- **Posición del micrófono**: El botón del micrófono **NO** se coloca en el centro del visualizador; se mantiene en su **posición inferior habitual**, ubicado justo debajo del visualizador acústico.
- **Superposición suave de capas (`z-index`)**: El visualizador acústico amplía su altura (a 140px) y margen inferior de modo que, si las ondas de choque o pulsos inferiores del orbe se expanden hacia abajo, pasen suavemente por detrás del botón del micrófono (que tendrá `z-index: 10`), evitando cualquier recorte brusco sin alterar la jerarquía visual actual.
- **Máscara de desvanecimiento suave en 4 direcciones**: Se aplica una máscara CSS elíptica y progresiva para que los extremos superior, inferior, izquierdo y derecho alcancen el 0% de opacidad sin bordes duros.

---

## 1. Visión General y Concepto

- **Problema actual**: El visualizador acústico tiene una altura física de solo 84px (`cy = 42px`). Cuando el modo Orbe emite pulsos o filamentos que superan 42px de radio, la animación se corta de forma horizontal en la parte superior e inferior.
- **Solución refinada**: 
  1. Aumentar la altura del canvas a **140px** (`cy = 70px`), otorgando espacio vertical holgado para la expansión natural de las ondas sonoras.
  2. Implementar una máscara elíptica suave en los 4 bordes para difuminar gradualmente cualquier trazo hacia la transparencia.
  3. Mantener el botón del micrófono en su lugar habitual inferior, permitiendo un leve traslape de capas (`margin-top: -16px` o superposición sutil) para que el micrófono flote por encima de las ondas inferiores mientras el lienzo permanece transparente y libre de eventos (`pointer-events: none`).

---

## 2. Experiencia de Usuario y Diseño Visual

### Jerarquía y Flujo Vertical

```
┌────────────────────────────────────────────────────────┐
│                      AmbientBar                        │
│                                                        │
│                  ╭──────────────╮                      │
│                  │  ◉        ◉  │   ← 1. Rostro Anime  │
│                  │      ⌣       │        Centrado      │
│                  ╰──────────────╯                      │
│                                                        │
│           ╭────────────────────────────╮               │
│           │   . . : : ≋ ≋ ≋ : : . .    │ ← 2. Visualizador
│           │   : ≋   ( Núcleo Orbe )  ≋ :│      Acústico │
│           │   . . : : ≋ ≋ ≋ : : . .    │      (140px)  │
│           ╰──────────────┬─────────────╯               │
│                     ╭────┴───╮                         │
│                     │ ( 🎙 ) │   ← 3. Micrófono        │
│                     ╰────────╯        Posición habitual │
│                                                        │
│       ▲ Desliza hacia arriba para ver conversación     │
└────────────────────────────────────────────────────────┘
```

### Reglas de Desvanecimiento y Capas
- **Máscara Elíptica Bidireccional**:
  ```css
  mask-image: radial-gradient(ellipse 92% 76% at 50% 50%, #000 45%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 92% 76% at 50% 50%, #000 45%, transparent 100%);
  ```
  El centro mantiene contraste pleno, mientras que los cuatro bordes (arriba, abajo, izquierda y derecha) se disuelven suavemente al 100% de transparencia.
- **Capa del Micrófono**:
  El micrófono conserva su botón de cristal (`width: 74px; height: 74px; z-index: 10; pointer-events: auto;`) situado inmediatamente bajo el visualizador, recibiendo clics y toques con total prioridad.

---

## 3. Decisiones de Producto y Trade-Offs

- **Ampliación de 84px a 140px**:
  - *Ventaja*: Los 70px de semieje vertical permiten que el núcleo del orbe (radio ~35px) y sus ondas expansivas (radio hasta 65px) respiren completamente sin alcanzar los límites físicos del canvas.
  - *Espacio en el escenario*: Gracias a la compactación previa de textos e instrucciones y al anclaje de la barra gestual en la base, 140px se acomoda armónicamente tanto en dispositivos móviles como en pantallas de escritorio sin empujar el rostro ni el micrófono.

- **Micro-interacciones y Puntero**:
  - `.canvasWrapper` tiene `pointer-events: none;`, por lo que tocar o hacer clic sobre cualquier parte del visualizador o cerca del micrófono sigue activando el micrófono o interactuando con el escenario con cero obstrucciones.

---

## 4. Arquitectura Técnica y Estrategia de Implementación

### Archivos a Modificar
1. **`src/presentation/components/Waveform.module.css`**:
   - Actualizar `.canvasWrapper` a `height: 140px`.
   - Reemplazar la máscara lineal horizontal por la máscara radial/elíptica compuesta en 4 direcciones.
2. **`src/presentation/components/Waveform.tsx`**:
   - Ajustar el centro vertical `cy = h / 2 = 70px`.
   - Calibrar las ondas de choque (`orbital`) y la altura de las barras (`bars`) para aprovechar el nuevo rango dinámico vertical de forma fluida.
3. **`src/presentation/components/AviApp.module.css`**:
   - Ajustar el espaciado entre el visualizador y `.voiceActionGroup` (micrófono) con una sutil superposición de capas (`z-index: 10`) manteniendo el orden vertical tradicional.
