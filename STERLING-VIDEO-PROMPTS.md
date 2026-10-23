# Sterling: guion y prompts para los 3 videos con gente real

Tres clips cortos para la sección de tarjetas de la home (`ShowcaseSection`). Cada uno acompaña a una tarjeta y se reproduce en bucle, sin sonido.

## Especificaciones (iguales para los tres)

| | |
|---|---|
| Proporción | 16:9 horizontal |
| Resolución | 1920×1080 si la herramienta lo permite (mínimo 1280×720) |
| Duración | 5 a 8 segundos |
| Sonido | ninguno (se reproduce silenciado) |
| Texto en imagen | ninguno: los títulos los pone la página |
| Cámara | movimiento lento y suave; sin cortes dentro del clip |
| Peso final | menos de 3 MB cada uno (ver "Después de generar") |

**Estilo común:** luz natural y cálida, profundidad de campo corta, aspecto de película realista, toques de azul (#3b82f6) en pantallas y reflejos para que combinen con la marca. Gente diversa, de las Américas, entre 25 y 45 años, ropa casual de trabajo. Pantallas siempre abstractas, sin texto legible.

---

## Video 1: Pagos — "Accept payments in any token"

**Nombre del archivo:** `sterling-payments-people.mp4`

**Idea:** un cliente paga en un comercio pequeño escaneando un código QR, y el dueño ve la confirmación al instante.

**Guion (cuadro a cuadro):**
1. (0–2 s) Plano medio en un café luminoso. La dueña, detrás del mostrador, sonríe a un cliente.
2. (2–4 s) El cliente apunta su teléfono a un código QR en un soporte sobre el mostrador. La pantalla del teléfono brilla en azul.
3. (4–6 s) La dueña mira su tableta; una luz azul suave se refleja en su cara y asiente.
4. (6–7 s) Le entrega el café. Ambos sonríen.

**Prompt (inglés):**
> Cinematic medium shot inside a bright, modern neighborhood café. A woman in her 30s, the owner, stands behind the counter and smiles at a customer. The customer holds up a smartphone toward a QR code on a small stand on the counter; the phone screen glows soft blue. The owner glances at a tablet, a gentle blue light reflects on her face, she nods with a satisfied smile and hands over a coffee. Warm natural window light, shallow depth of field, slow gentle push-in, realistic skin and hands, natural movements, 24 fps, 16:9, no text or logos visible anywhere.

---

## Video 2: Tesorería — "Shared treasury, shared control"

**Nombre del archivo:** `sterling-multisig-people.mp4`

**Idea:** tres socios aprueban juntos una operación, cada uno desde su propio dispositivo.

**Guion:**
1. (0–2 s) Tres socios sentados en una mesa en una oficina luminosa; cada uno con su laptop o teléfono.
2. (2–5 s) Uno por uno revisan su pantalla y asienten; el primero toca su pantalla, luego el segundo.
3. (5–7 s) Se miran entre ellos y chocan los puños o se sonríen: la operación quedó aprobada.

**Prompt (inglés):**
> Cinematic wide-to-medium shot of three business partners, two women and one man of different ethnicities, seated around a wooden table in a bright modern office with large windows. Each looks at their own laptop or phone. One by one they review their screens, nod, and tap to confirm; subtle soft blue glow on their faces from the screens. At the end they exchange a confident glance and share a quiet fist bump. Calm professional atmosphere, natural daylight, shallow depth of field, slow gentle orbit around the table, realistic faces and hands, 24 fps, 16:9, screens abstract with no readable text, no logos.

---

## Video 3: Lanzador de tokens — "Launch your token"

**Nombre del archivo:** `sterling-launcher-people.mp4`

**Idea:** un equipo pequeño lanza su proyecto y celebra.

**Guion:**
1. (0–2 s) Equipo joven en un espacio creativo al atardecer; todos miran una laptop.
2. (2–4 s) Una persona presiona una tecla con decisión.
3. (4–7 s) El equipo reacciona con alegría contenida; detrás, una pantalla grande con una línea abstracta que sube.

**Prompt (inglés):**
> Cinematic medium shot of a small team of four young creators and developers in a stylish startup workspace at golden hour. They gather around a laptop; one person confidently presses a key. The team reacts with restrained joy, smiles and small hugs. In the background a large screen shows an abstract glowing blue line chart rising, with no numbers or text. Warm sunset light through windows mixed with cool blue screen light, subtle handheld camera feel, shallow depth of field, realistic faces and hands, natural movement, 24 fps, 16:9, no readable text, no logos.

---

## Prompt negativo (si la herramienta lo permite; pégalo en los tres)

> text, subtitles, watermark, logo, brand names, readable screen text, distorted hands, extra fingers, warped or melting faces, flickering, morphing objects, sudden cuts, cartoon, 3D render, low quality, blurry

## Consejos para que salgan bien
- Genera 3 o 4 versiones por video y quédate con la mejor.
- Si aparecen manos deformes o texto raro, vuelve a generar o acorta la acción (menos movimiento = menos errores).
- Evita primeros planos de manos y de pantallas; los planos medios fallan menos.
- Revisa que no aparezcan logos reales (por ejemplo, el de un teléfono).

## Después de generar (comandos con ffmpeg)

Reducir peso, quitar audio y dejarlo listo para web:

```bash
ffmpeg -i entrada.mp4 -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow -an -movflags +faststart sterling-payments-people.mp4
```

Imagen de portada (el cuadro del segundo 2):

```bash
ffmpeg -i sterling-payments-people.mp4 -ss 2 -vframes 1 -q:v 3 sterling-payments-people-poster.jpg
```

Si el clip no cierra bien en bucle, hacerlo "ida y vuelta":

```bash
ffmpeg -i entrada.mp4 -filter_complex "[0:v]reverse[r];[0:v][r]concat=n=2:v=1[v]" -map "[v]" -an salida-loop.mp4
```

## Dónde ponerlos
Copia los archivos a `public/videos/` con los nombres de arriba (y su imagen de portada con el sufijo `-poster.jpg`) y avísame: cambio la sección para que use esos videos en lugar de las animaciones actuales. Las animaciones actuales no se borran.

## Antes de publicar (revisa con un abogado)
- Comprueba que la herramienta que uses permite **uso comercial** de lo que genera.
- Si muestras personas generadas con IA, considera indicarlo en la página.
- Si grabas personas reales o usas video de stock, guarda la **licencia o el permiso de imagen** de cada persona.
