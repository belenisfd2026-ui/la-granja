/* ==========================================================================
   A. SISTEMA DE AUDIO AUTÓNOMO (WEB AUDIO API: MÚSICA DE MARIMBA Y SFX)
   ========================================================================== */
const SoundManager = (() => {
  let audioCtx = null;
  let musicIsPlaying = false;
  let musicTimer = null;
  let stepIndex = 0;

  function initContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Síntesis de tono de marimba/xilófono de madera suave
  function playMarimbaTone(freq, duration = 0.35, gainVal = 0.12) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'triangle'; // Calidez acústica
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Ataque percusivo rápido y decaimiento suave
      gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(gainVal, audioCtx.currentTime + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Loop folclórico suave (Escala pentatónica campestre alegre)
  // Do (261.6), Re (293.6), Mi (329.6), Sol (392.0), La (440.0), Do5 (523.2)
  const folkLoop = [
    261.6, 329.6, 392.0, 523.2,
    392.0, 329.6, 293.6, 329.6,
    261.6, 392.0, 440.0, 392.0,
    329.6, 293.6, 261.6, 0
  ];

  function stepMusic() {
    if (!musicIsPlaying || !audioCtx) return;
    const note = folkLoop[stepIndex % folkLoop.length];
    if (note > 0) {
      playMarimbaTone(note, 0.28, 0.06);
    }
    stepIndex++;
    musicTimer = setTimeout(stepMusic, 280); // ~107 BPM suave
  }

  function startMusic() {
    initContext();
    if (musicIsPlaying) return;
    musicIsPlaying = true;
    stepIndex = 0;
    stepMusic();
  }

  function stopMusic() {
    musicIsPlaying = false;
    if (musicTimer) {
      clearTimeout(musicTimer);
      musicTimer = null;
    }
  }

  function toggleMusic() {
    initContext();
    if (musicIsPlaying) {
      stopMusic();
      return false;
    } else {
      startMusic();
      return true;
    }
  }

  // SFX 1: Acierto alegre (Arpegio en Do Mayor: C5, E5, G5, C6)
  function playSuccess() {
    initContext();
    if (!audioCtx) return;
    const arpeggio = [523.25, 659.25, 783.99, 1046.5];
    arpeggio.forEach((f, i) => {
      setTimeout(() => playMarimbaTone(f, 0.4, 0.18), i * 85);
    });
  }

  // SFX 2: Reintento amigable (Doble tono cálido)
  function playRetry() {
    initContext();
    if (!audioCtx) return;
    playMarimbaTone(392.0, 0.2, 0.1);
    setTimeout(() => playMarimbaTone(329.6, 0.25, 0.1), 140);
  }

  // SFX 3: Pop de conteo / clic
  function playPop() {
    initContext();
    if (!audioCtx) return;
    playMarimbaTone(587.3, 0.14, 0.15); // Re5
  }

  // SFX 4: Tintineo de moneda / billete
  function playCoin() {
    initContext();
    if (!audioCtx) return;
    playMarimbaTone(880.0, 0.2, 0.18);
    setTimeout(() => playMarimbaTone(1318.5, 0.3, 0.15), 75);
  }

  // SFX 5: Pío Pío del pollito
  function playPioChirp() {
    initContext();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2200, audioCtx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.16);

      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1500, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(2400, audioCtx.currentTime + 0.08);
        gain2.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.16);
      }, 180);
    } catch (e) {}
  }

  // SFX 6: Fanfarria de victoria
  function playFanfare() {
    initContext();
    if (!audioCtx) return;
    const notes = [392.0, 392.0, 392.0, 523.25, 659.25, 783.99];
    const times = [0, 130, 260, 390, 560, 800];
    notes.forEach((f, i) => {
      setTimeout(() => playMarimbaTone(f, 0.48, 0.2), times[i]);
    });
  }

  return {
    initContext,
    startMusic,
    stopMusic,
    toggleMusic,
    isMusicActive: () => musicIsPlaying,
    playSuccess,
    playRetry,
    playPop,
    playCoin,
    playPioChirp,
    playFanfare
  };
})();

/* ==========================================================================
   B. MÓDULO DE SÍNTESIS VOCAL (WEB SPEECH API: ESPAÑOL LATINO/ARGENTINO)
   ========================================================================== */
const SpeechManager = (() => {
  const synth = window.speechSynthesis;
  let cachedVoices = [];

  function loadVoices() {
    if (!synth) return;
    cachedVoices = synth.getVoices() || [];
  }

  if (synth) {
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }

  // Filtro para español rioplatense / latinoamericano (excluyendo España)
  function getBestVoice() {
    if (!cachedVoices || cachedVoices.length === 0) {
      loadVoices();
    }

    // 1. es-AR (Argentina)
    let voice = cachedVoices.find(v => v.lang && v.lang.toLowerCase() === 'es-ar');
    if (voice) return voice;

    // 2. es-419 (Latinoamérica) o es-MX / es-US
    voice = cachedVoices.find(v => {
      const l = (v.lang || '').toLowerCase();
      return l.includes('es-419') || l.includes('es-mx') || l.includes('es-us');
    });
    if (voice) return voice;

    // 3. Voces en español genéricas que NO sean de España ('es-es')
    voice = cachedVoices.find(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      const isSpanish = l.startsWith('es') || n.includes('spanish') || n.includes('español');
      const isSpain = l.includes('es-es') || n.includes('spain') || n.includes('castilian');
      return isSpanish && !isSpain;
    });
    if (voice) return voice;

    return cachedVoices.find(v => (v.lang || '').toLowerCase().startsWith('es'));
  }

  function speak(text, onStart, onEnd) {
    if (!synth) return;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.lang = (bestVoice && bestVoice.lang) || 'es-AR';
    utterance.pitch = 1.2;  // Tono cálido, amigable e infantil
    utterance.rate = 0.88;  // Ritmo pausado y claro para primer ciclo

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    synth.speak(utterance);
  }

  function stop() {
    if (synth) synth.cancel();
  }

  return { speak, stop };
})();

/* ==========================================================================
   C. EFECTO DE CONFETI EN CANVAS (TOTALMENTE AUTOCONTENIDO)
   ========================================================================== */
const ConfettiEffect = (() => {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationFrame = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function launch(count = 75) {
    resize();
    particles = [];
    const colors = ['#ffb703', '#fb8500', '#0077b6', '#38b000', '#e63946', '#7209b7', '#ffd166'];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width * 0.5 + (Math.random() * 260 - 130),
        y: canvas.height * 0.38,
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -12 - 5,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }
    if (!animationFrame) loop();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = 0;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38;
      p.rotation += p.vRot;
      p.alpha -= 0.007;

      if (p.alpha > 0) {
        active++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (active > 0) {
      animationFrame = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrame = null;
    }
  }

  return { launch };
})();

/* ==========================================================================
   D. CONTENIDO CURRICULAR PEDAGÓGICO COMPLETO (4 NIVELES)
   ========================================================================== */
const FarmCurriculumData = {
  // NIVEL 1: El Corral de Pío (Números iniciales, vocales y conteo hasta 10)
  level1: {
    id: 1,
    title: "El Corral de Pío",
    welcomeMessage: "¡Bienvenido al corral! Vamos a contar animalitos, reconocer números y encontrar vocales.",
    tasks: [
      {
        type: "counting",
        prompt: "¡Contá cuántos patitos están nadando en el charco y elegí el número!",
        voicePrompt: "Contá cuántos patitos están nadando en el charco y elegí el número correcto.",
        itemEmoji: "🦆",
        count: 4,
        options: [
          { val: 4, label: "4", word: "CUATRO" },
          { val: 3, label: "3", word: "TRES" },
          { val: 5, label: "5", word: "CINCO" }
        ],
        correctVal: 4,
        successText: "¡Qué bien! Hay cuatro patitos en el charco."
      },
      {
        type: "number_name",
        prompt: "¿Cuál de estas palabras es el nombre del número 8?",
        voicePrompt: "¿Cuál de estas palabras es el nombre del número ocho?",
        displayHero: "8",
        options: [
          { val: "SIETE", label: "SIETE", word: "7" },
          { val: "OCHO", label: "OCHO", word: "8" },
          { val: "NUEVE", label: "NUEVE", word: "9" }
        ],
        correctVal: "OCHO",
        successText: "¡Exacto! El 8 se escribe OCHO."
      },
      {
        type: "vowel_sound",
        prompt: "¿Con qué vocal empieza la palabra OVEJA? 🐑",
        voicePrompt: "¿Con qué vocal empieza la palabra oveja? Mirá bien las opciones.",
        displayHero: "🐑",
        heroSub: "O - VE - JA",
        options: [
          { val: "A", label: "A", word: "Abeja" },
          { val: "O", label: "O", word: "Oveja" },
          { val: "U", label: "U", word: "Uva" }
        ],
        correctVal: "O",
        successText: "¡Genial! Oveja empieza con la letra O."
      },
      {
        type: "counting",
        prompt: "¡Contá cuántas vaquitas lecheras están comiendo pasto!",
        voicePrompt: "Contá cuántas vaquitas lecheras están comiendo pasto en el corral.",
        itemEmoji: "🐄",
        count: 6,
        options: [
          { val: 5, label: "5", word: "CINCO" },
          { val: 6, label: "6", word: "SEIS" },
          { val: 7, label: "7", word: "SIETE" }
        ],
        correctVal: 6,
        successText: "¡Excelente! Hay seis vacas en el corral."
      },
      {
        type: "number_name",
        prompt: "¿Cuál de estas palabras es el nombre del número 5?",
        voicePrompt: "¿Cuál de estas palabras es el nombre del número cinco?",
        displayHero: "5",
        options: [
          { val: "CUATRO", label: "CUATRO", word: "4" },
          { val: "CINCO", label: "CINCO", word: "5" },
          { val: "SEIS", label: "SEIS", word: "6" }
        ],
        correctVal: "CINCO",
        successText: "¡Muy bien! El 5 se escribe CINCO."
      },
      {
        type: "vowel_sound",
        prompt: "¿Con qué vocal empieza la palabra ABEJA? 🐝",
        voicePrompt: "¿Con qué vocal empieza la palabra abeja?",
        displayHero: "🐝",
        heroSub: "A - BE - JA",
        options: [
          { val: "E", label: "E", word: "Elefante" },
          { val: "A", label: "A", word: "Abeja" },
          { val: "I", label: "I", word: "Isla" }
        ],
        correctVal: "A",
        successText: "¡Bárbaro! Abeja empieza con la letra A."
      }
    ]
  },

  // NIVEL 2: La Huerta de las Sílabas (Armado de palabras y sumas con frutas)
  level2: {
    id: 2,
    title: "La Huerta de las Sílabas",
    welcomeMessage: "¡Llegamos a la huerta! Uní las fichas de sílabas para escribir los nombres y resolvé sumas ricas.",
    tasks: [
      {
        type: "syllable_builder",
        prompt: "¡Armá el nombre de este animalito uniendo las sílabas: VA - CA!",
        voicePrompt: "Armá el nombre de este animalito uniendo las sílabas: VACA.",
        targetEmoji: "🐮",
        targetWord: "VACA",
        syllables: ["VA", "CA"],
        tiles: ["CA", "VA", "PA", "TO"],
        successText: "¡Bárbaro! V-A con C-A forman la palabra VACA."
      },
      {
        type: "visual_addition",
        prompt: "Don Jacinto cosechó 3 zanahorias y después cosechó 2 más. ¿Cuántas tiene en total?",
        voicePrompt: "Don Jacinto cosechó tres zanahorias y después cosechó dos más. ¿Cuántas zanahorias tiene en total?",
        groupA: { count: 3, emoji: "🥕" },
        groupB: { count: 2, emoji: "🥕" },
        operator: "+",
        options: [
          { val: 4, label: "4", word: "CUATRO" },
          { val: 5, label: "5", word: "CINCO" },
          { val: 6, label: "6", word: "SEIS" }
        ],
        correctVal: 5,
        successText: "¡Muy bien! 3 más 2 es igual a 5 zanahorias."
      },
      {
        type: "syllable_builder",
        prompt: "¡Armá el nombre de esta fruta deliciosa: MA - NZA - NA!",
        voicePrompt: "Armá el nombre de esta fruta deliciosa uniendo sus sílabas: MANZANA.",
        targetEmoji: "🍎",
        targetWord: "MANZANA",
        syllables: ["MA", "NZA", "NA"],
        tiles: ["NZA", "MA", "LO", "NA"],
        successText: "¡Qué rico! M-A, N-Z-A y N-A forman MANZANA."
      },
      {
        type: "syllable_builder",
        prompt: "¡Armá el nombre del fiel guardián de la granja: PER - RO!",
        voicePrompt: "Armá el nombre del fiel guardián de la granja: PERRO.",
        targetEmoji: "🐶",
        targetWord: "PERRO",
        syllables: ["PER", "RO"],
        tiles: ["RO", "PER", "GAT", "TO"],
        successText: "¡Hermoso! P-E-R con R-O forman la palabra PERRO."
      },
      {
        type: "visual_addition",
        prompt: "En la huerta maduraron 4 tomates rojos y hoy cosecharon 3 más. ¿Cuántos son en total?",
        voicePrompt: "En la huerta maduraron cuatro tomates y hoy cosecharon tres más. ¿Cuántos tomates son en total?",
        groupA: { count: 4, emoji: "🍅" },
        groupB: { count: 3, emoji: "🍅" },
        operator: "+",
        options: [
          { val: 6, label: "6", word: "SEIS" },
          { val: 7, label: "7", word: "SIETE" },
          { val: 8, label: "8", word: "OCHO" }
        ],
        correctVal: 7,
        successText: "¡Genial! 4 tomates más 3 tomates suman 7 tomates."
      },
      {
        type: "syllable_builder",
        prompt: "¡Armá el nombre de esta verdura saludable: TO - MA - TE!",
        voicePrompt: "Armá el nombre de esta verdura saludable: TOMATE.",
        targetEmoji: "🍅",
        targetWord: "TOMATE",
        syllables: ["TO", "MA", "TE"],
        tiles: ["MA", "TE", "TO", "SA"],
        successText: "¡Perfecto! T-O, M-A y T-E forman TOMATE."
      }
    ]
  },

  // NIVEL 3: El Granero de los Números ($10 y $1, decenas y unidades, números hasta 50, restas)
  level3: {
    id: 3,
    title: "El Granero de los Números",
    welcomeMessage: "¡Entramos al granero! Usá billetes de $10 y monedas de $1 para pagar, reconocé números y restá.",
    tasks: [
      {
        type: "money_counter",
        prompt: "La bolsa de maíz cuesta $23. ¡Armá el valor usando billetes de $10 y monedas de $1!",
        voicePrompt: "La bolsa de maíz cuesta veintitrés pesos. Armá el valor justo usando billetes de diez pesos y monedas de un peso.",
        productEmoji: "🌽",
        productName: "Bolsa de Maíz",
        targetPrice: 23,
        hint: "Necesitás 2 billetes de $10 y 3 monedas de $1.",
        successText: "¡Perfecto! 2 billetes de $10 y 3 monedas de $1 suman exactamente $23."
      },
      {
        type: "number_name",
        prompt: "¿Cómo se llama este número: 15?",
        voicePrompt: "¿Cómo se llama el número quince? Elegí la palabra escrita correcta.",
        displayHero: "15",
        options: [
          { val: "CINCO", label: "CINCO", word: "5" },
          { val: "QUINCE", label: "QUINCE", word: "15" },
          { val: "CINCUENTA", label: "CINCUENTA", word: "50" }
        ],
        correctVal: "QUINCE",
        successText: "¡Bárbaro! El 15 se escribe QUINCE."
      },
      {
        type: "visual_subtraction",
        prompt: "Había 7 huevos en la canasta 🥚. La gallina usó 3 para una torta. ¿Cuántos quedaron?",
        voicePrompt: "Había siete huevos en la canasta. La gallina usó tres para cocinar una torta. ¿Cuántos quedaron?",
        initialCount: 7,
        subtractCount: 3,
        itemEmoji: "🥚",
        options: [
          { val: 3, label: "3", word: "TRES" },
          { val: 4, label: "4", word: "CUATRO" },
          { val: 5, label: "5", word: "CINCO" }
        ],
        correctVal: 4,
        successText: "¡Qué buen cálculo! Si a 7 le quitamos 3, quedan 4 huevos."
      },
      {
        type: "money_counter",
        prompt: "Un queso fresco de la granja cuesta $34. ¡Colocá los billetes y monedas en el mostrador!",
        voicePrompt: "Un queso fresco cuesta treinta y cuatro pesos. Colocá los billetes de diez y las monedas de un peso necesarios.",
        productEmoji: "🧀",
        productName: "Queso de Campo",
        targetPrice: 34,
        hint: "Son 3 billetes de $10 y 4 monedas de $1.",
        successText: "¡Impecable! 3 dieces ($30) y 4 unos ($4) hacen $34."
      },
      {
        type: "number_name",
        prompt: "¿Cómo se llama este número redondo: 30?",
        voicePrompt: "¿Cómo se llama el número treinta?",
        displayHero: "30",
        options: [
          { val: "TRECE", label: "TRECE", word: "13" },
          { val: "TREINTA", label: "TREINTA", word: "30" },
          { val: "TRES", label: "TRES", word: "3" }
        ],
        correctVal: "TREINTA",
        successText: "¡Genial! El 30 se escribe TREINTA."
      },
      {
        type: "visual_subtraction",
        prompt: "Había 9 manzanas en el cajón 🍎. El granjero regaló 4. ¿Cuántas manzanas le quedaron?",
        voicePrompt: "Había nueve manzanas en el cajón y el granjero regaló cuatro. ¿Cuántas quedaron?",
        initialCount: 9,
        subtractCount: 4,
        itemEmoji: "🍎",
        options: [
          { val: 4, label: "4", word: "CUATRO" },
          { val: 5, label: "5", word: "CINCO" },
          { val: 6, label: "6", word: "SEIS" }
        ],
        correctVal: 5,
        successText: "¡Exacto! 9 menos 4 es igual a 5 manzanas."
      }
    ]
  },

  // NIVEL 4: La Gran Fiesta (Lectura de oraciones, escalas numéricas y cálculo mental)
  level4: {
    id: 4,
    title: "La Gran Fiesta de la Granja",
    welcomeMessage: "¡Llegó la fiesta! Leé oraciones con atención, completá los caminitos de números y resolvé los desafíos finales.",
    tasks: [
      {
        type: "reading_comp",
        prompt: "Leé con mucha atención la siguiente oración y respondé la pregunta:",
        voicePrompt: "Leé con mucha atención la oración y respondé la pregunta de Pío.",
        sentence: "EL CABALLO COME PASTO FRESCO CERCA DEL MOLINO.",
        question: "¿Qué come el caballo?",
        options: [
          { val: "MANZANAS", label: "MANZANAS 🍎" },
          { val: "PASTO FRESCO", label: "PASTO FRESCO 🌿" },
          { val: "SEMILLAS", label: "SEMILLAS 🌾" }
        ],
        correctVal: "PASTO FRESCO",
        successText: "¡Gran lectura! El caballo come pasto fresco."
      },
      {
        type: "number_sequence",
        prompt: "El tractor avanza de 2 en 2. ¿Qué número falta en el adoquín amarillo?",
        voicePrompt: "El tractor avanza de dos en dos: dos, cuatro, seis, ¿qué número falta antes del diez?",
        sequence: [2, 4, 6, "?", 10],
        missingVal: 8,
        options: [
          { val: 7, label: "7" },
          { val: 8, label: "8" },
          { val: 9, label: "9" }
        ],
        correctVal: 8,
        successText: "¡Muy bien! Siguiendo la escala de dos en dos va el 8."
      },
      {
        type: "reading_comp",
        prompt: "Leé esta oración sobre los animalitos de la fiesta:",
        voicePrompt: "Leé esta oración y respondé quién canta al amanecer.",
        sentence: "EL GALLO BARTOLO CANTA MUY TEMPRANO AL SALIR EL SOL.",
        question: "¿Quién canta al salir el sol?",
        options: [
          { val: "EL CHANCHO", label: "EL CHANCHO 🐷" },
          { val: "EL GALLO BARTOLO", label: "EL GALLO BARTOLO 🐓" },
          { val: "EL PATO", label: "EL PATO 🦆" }
        ],
        correctVal: "EL GALLO BARTOLO",
        successText: "¡Genial comprensión! Es el gallo Bartolo."
      },
      {
        type: "number_sequence",
        prompt: "Los banderines avanzan de 5 en 5: 5, 10, 15, [?], 25. ¿Cuál falta?",
        voicePrompt: "Los banderines avanzan de cinco en cinco: cinco, diez, quince, ¿cuál falta para llegar a veinticinco?",
        sequence: [5, 10, 15, "?", 25],
        missingVal: 20,
        options: [
          { val: 18, label: "18" },
          { val: 20, label: "20" },
          { val: 22, label: "22" }
        ],
        correctVal: 20,
        successText: "¡Excelente! La escala de 5 en 5 continúa con el 20."
      },
      {
        type: "reading_comp",
        prompt: "Leé esta oración sobre la merienda campestre:",
        voicePrompt: "Leé esta oración y respondé de qué sabor es la rica torta.",
        sentence: "EN LA MESA HAY UNA TORTA DULCE CON FRUTILLAS DE LA HUERTA.",
        question: "¿De qué es la torta dulce?",
        options: [
          { val: "CHOCOLATE", label: "CHOCOLATE 🍫" },
          { val: "FRUTILLAS", label: "FRUTILLAS 🍓" },
          { val: "LIMÓN", label: "LIMÓN 🍋" }
        ],
        correctVal: "FRUTILLAS",
        successText: "¡Hermosa lectura! La torta tiene frutillas de la huerta."
      },
      {
        type: "number_sequence",
        prompt: "El caminito de globos avanza de 10 en 10: 10, 20, 30, [?], 50. ¿Cuál falta?",
        voicePrompt: "El caminito avanza de diez en diez: diez, veinte, treinta, ¿cuál falta para llegar a cincuenta?",
        sequence: [10, 20, 30, "?", 50],
        missingVal: 40,
        options: [
          { val: 35, label: "35" },
          { val: 40, label: "40" },
          { val: 45, label: "45" }
        ],
        correctVal: 40,
        successText: "¡Sensacional! La escala de 10 en 10 continúa con el 40."
      }
    ]
  }
};

/* ==========================================================================
   E. CONTROLADOR PRINCIPAL DEL JUEGO (ESTADO, NAVEGACIÓN Y MECÁNICAS)
   ========================================================================== */
const GameController = (() => {
  const STORAGE_KEY = "granja_del_saber_data_v2";

  let state = {
    playerName: "Martín",
    playerAvatar: "👦",
    unlockedLevel: 1,
    stars: { 1: 0, 2: 0, 3: 0, 4: 0 },
    currentLevelId: 1,
    currentTaskIndex: 0,
    tempMistakes: 0
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = { ...state, ...parsed };
      }
    } catch (e) {
      console.error("Error al cargar localStorage", e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Error al guardar localStorage", e);
    }
  }

  function init() {
    loadState();
    updateHeaderUI();
    updateMapCardsUI();
    setupGlobalEvents();
    updatePioSpeech(`¡Hola ${state.playerName}! Te doy la bienvenida a La Granja del Saber. Elegí un lugar del mapa para empezar a jugar.`);
  }

  function updateHeaderUI() {
    document.getElementById('headerPlayerName').textContent = state.playerName || "Amiguito/a";
    document.getElementById('headerPlayerAvatar').textContent = state.playerAvatar || "👦";
    document.getElementById('diplomaPlayerName').textContent = state.playerName || "Amiguito/a";

    const totalStars = Object.values(state.stars).reduce((a, b) => a + b, 0);
    document.getElementById('totalStarsCount').textContent = totalStars;

    const hoy = new Date();
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('diplomaDateText').textContent = hoy.toLocaleDateString('es-AR', opciones);
  }

  function updateMapCardsUI() {
    for (let lvl = 1; lvl <= 4; lvl++) {
      const card = document.getElementById(`cardLevel${lvl}`);
      const starsRow = document.getElementById(`starsLevel${lvl}`);
      if (!card) continue;

      if (lvl <= state.unlockedLevel) {
        card.classList.remove('locked');
        card.querySelector('.btn-play-level').textContent = "¡Jugar ahora!";
      } else {
        card.classList.add('locked');
        card.querySelector('.btn-play-level').textContent = "🔒 Bloqueado";
      }

      const starCount = state.stars[lvl] || 0;
      if (starsRow) {
        starsRow.innerHTML = "";
        for (let s = 1; s <= 3; s++) {
          const span = document.createElement('span');
          span.className = `star-icon ${s <= starCount ? 'filled' : ''}`;
          span.textContent = "★";
          starsRow.appendChild(span);
        }
      }
    }
  }

  function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function updatePioSpeech(msg, autoSpeak = false) {
    const pioEl = document.getElementById('pioSpeechText');
    pioEl.textContent = msg;
    if (autoSpeak) {
      triggerPioSpeak();
    }
  }

  function triggerPioSpeak() {
    const text = document.getElementById('pioSpeechText').textContent;
    const btn = document.getElementById('btnSpeakPio');
    btn.classList.add('speaking');
    SpeechManager.speak(text, null, () => {
      btn.classList.remove('speaking');
    });
  }

  function showFeedback(isSuccess, text) {
    const banner = document.getElementById('feedbackBanner');
    const icon = document.getElementById('feedbackIcon');
    const msg = document.getElementById('feedbackMsg');

    banner.className = `feedback-banner show ${isSuccess ? 'success' : 'retry'}`;
    icon.textContent = isSuccess ? "🌟" : "💡";
    msg.textContent = text;

    if (isSuccess) {
      SoundManager.playSuccess();
    } else {
      SoundManager.playRetry();
    }

    setTimeout(() => {
      banner.classList.remove('show');
    }, 2200);
  }

  /* ------------------------------------------------------------------------
     INICIO Y GESTIÓN DE NIVELES
     ------------------------------------------------------------------------ */
  function startLevel(lvlId) {
    SoundManager.initContext();
    if (lvlId > state.unlockedLevel) {
      showFeedback(false, "¡Completá el nivel anterior primero para desbloquear este rincón!");
      return;
    }

    state.currentLevelId = lvlId;
    state.currentTaskIndex = 0;
    state.tempMistakes = 0;

    const levelData = FarmCurriculumData[`level${lvlId}`];
    document.getElementById('currentLevelHeading').textContent = `Nivel ${lvlId}: ${levelData.title}`;
    document.getElementById('levelTempStars').textContent = state.stars[lvlId] || 0;

    showView('viewGame');
    updatePioSpeech(levelData.welcomeMessage, true);
    renderCurrentTask();
  }

  function renderCurrentTask() {
    const levelData = FarmCurriculumData[`level${state.currentLevelId}`];
    const task = levelData.tasks[state.currentTaskIndex];

    // Indicador de avance
    const dotsContainer = document.getElementById('progressDotsContainer');
    dotsContainer.innerHTML = "";
    levelData.tasks.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `prog-dot ${idx === state.currentTaskIndex ? 'active' : ''} ${idx < state.currentTaskIndex ? 'done' : ''}`;
      dotsContainer.appendChild(dot);
    });

    // Consigna en pantalla y audio
    document.getElementById('taskPromptText').textContent = task.prompt;
    const btnListen = document.getElementById('btnListenTask');
    btnListen.onclick = () => {
      SpeechManager.speak(task.voicePrompt || task.prompt);
    };

    const stage = document.getElementById('interactiveStage');
    stage.innerHTML = "";

    switch (task.type) {
      case 'counting':
        renderCountingTask(task, stage);
        break;
      case 'number_name':
        renderNumberNameTask(task, stage);
        break;
      case 'vowel_sound':
        renderVowelTask(task, stage);
        break;
      case 'syllable_builder':
        renderSyllableBuilderTask(task, stage);
        break;
      case 'visual_addition':
        renderVisualAdditionTask(task, stage);
        break;
      case 'visual_subtraction':
        renderVisualSubtractionTask(task, stage);
        break;
      case 'money_counter':
        renderMoneyTask(task, stage);
        break;
      case 'reading_comp':
        renderReadingCompTask(task, stage);
        break;
      case 'number_sequence':
        renderSequenceTask(task, stage);
        break;
    }
  }

  /* ------------------------------------------------------------------------
     RENDERERS DIDÁCTICOS ESPECÍFICOS
     ------------------------------------------------------------------------ */

  // 1. Conteo interactivo
  function renderCountingTask(task, container) {
    const pen = document.createElement('div');
    pen.className = 'counting-farm-pen';
    pen.title = "¡Tocá cada animalito para contarlo con sonido!";

    let countedSoFar = 0;
    for (let i = 1; i <= task.count; i++) {
      const item = document.createElement('div');
      item.className = 'countable-item';
      item.innerHTML = task.itemEmoji;

      item.onclick = () => {
        if (!item.classList.contains('counted')) {
          countedSoFar++;
          item.classList.add('counted');
          const badge = document.createElement('span');
          badge.className = 'countable-badge';
          badge.textContent = countedSoFar;
          item.appendChild(badge);
          SoundManager.playPop();
          SpeechManager.speak(countedSoFar.toString());
        }
      };
      pen.appendChild(item);
    }
    container.appendChild(pen);

    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';

    task.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-option-card';
      btn.innerHTML = `<span>${opt.label}</span><span class="option-subword">${opt.word}</span>`;
      btn.onclick = () => handleChoiceAnswer(opt.val, task.correctVal, task.successText);
      optionsGrid.appendChild(btn);
    });

    container.appendChild(optionsGrid);
  }

  // 2. Reconocimiento de número y nombre en palabras
  function renderNumberNameTask(task, container) {
    const hero = document.createElement('div');
    hero.style.cssText = `
      font-size: 5rem;
      font-weight: 800;
      color: #0284c7;
      background: #e0f2fe;
      border: 4px solid #38bdf8;
      border-radius: var(--radius-md);
      padding: 16px 48px;
      margin-bottom: 26px;
      box-shadow: var(--shadow-btn);
    `;
    hero.textContent = task.displayHero;
    container.appendChild(hero);

    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';

    task.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-option-card';
      btn.innerHTML = `<span>${opt.label}</span>`;
      btn.onclick = () => handleChoiceAnswer(opt.val, task.correctVal, task.successText);
      optionsGrid.appendChild(btn);
    });

    container.appendChild(optionsGrid);
  }

  // 3. Vocales y sonido inicial
  function renderVowelTask(task, container) {
    const heroBox = document.createElement('div');
    heroBox.style.cssText = `text-align: center; margin-bottom: 22px;`;
    heroBox.innerHTML = `
      <div style="font-size: 5.2rem; line-height: 1;">${task.displayHero}</div>
      <div style="font-size: 1.7rem; font-weight: 800; color: #1e3a8a; letter-spacing: 2px; margin-top: 8px;">${task.heroSub}</div>
    `;
    container.appendChild(heroBox);

    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';

    task.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-option-card';
      btn.innerHTML = `<span style="font-size: 2.2rem;">${opt.label}</span><span class="option-subword">${opt.word}</span>`;
      btn.onclick = () => handleChoiceAnswer(opt.val, task.correctVal, task.successText);
      optionsGrid.appendChild(btn);
    });

    container.appendChild(optionsGrid);
  }

  // 4. Armado de palabras con fichas de sílabas
  function renderSyllableBuilderTask(task, container) {
    const wrap = document.createElement('div');
    wrap.className = 'syllables-builder-area';

    const hero = document.createElement('div');
    hero.className = 'word-target-hero';
    hero.innerHTML = `
      <div class="word-target-emoji">${task.targetEmoji}</div>
      <div class="word-target-hint">Armá la palabra: <strong>${task.targetWord}</strong></div>
    `;
    wrap.appendChild(hero);

    const slotsRow = document.createElement('div');
    slotsRow.className = 'syllable-slots-container';

    const currentSlots = [];
    for (let i = 0; i < task.syllables.length; i++) {
      const slot = document.createElement('div');
      slot.className = 'syllable-slot';
      slot.dataset.index = i;
      slot.textContent = "_";
      slot.title = "Tocá acá para devolver la sílaba al banco";

      slot.onclick = () => {
        if (currentSlots[i]) {
          const tileToRestore = currentSlots[i];
          tileToRestore.element.classList.remove('used');
          currentSlots[i] = null;
          slot.textContent = "_";
          slot.classList.remove('filled');
          SoundManager.playPop();
        }
      };

      slotsRow.appendChild(slot);
    }
    wrap.appendChild(slotsRow);

    const bank = document.createElement('div');
    bank.className = 'syllable-tiles-bank';

    task.tiles.forEach(syll => {
      const tile = document.createElement('button');
      tile.className = 'syllable-tile';
      tile.textContent = syll;

      tile.onclick = () => {
        const firstEmptyIdx = currentSlots.findIndex(s => !s);
        const targetIdx = firstEmptyIdx !== -1 ? firstEmptyIdx : (currentSlots.length < task.syllables.length ? currentSlots.length : -1);

        if (targetIdx !== -1 && targetIdx < task.syllables.length) {
          currentSlots[targetIdx] = { val: syll, element: tile };
          tile.classList.add('used');

          const slotEl = slotsRow.children[targetIdx];
          slotEl.textContent = syll;
          slotEl.classList.add('filled');
          SoundManager.playPop();
          SpeechManager.speak(syll);

          const filledCount = currentSlots.filter(Boolean).length;
          if (filledCount === task.syllables.length) {
            checkSyllableAssembly(currentSlots, task);
          }
        }
      };

      bank.appendChild(tile);
    });
    wrap.appendChild(bank);

    container.appendChild(wrap);
  }

  function checkSyllableAssembly(slots, task) {
    const formedWord = slots.map(s => s ? s.val : "").join("");
    const expectedWord = task.syllables.join("");

    if (formedWord === expectedWord) {
      showFeedback(true, task.successText);
      updatePioSpeech(task.successText, true);
      setTimeout(() => advanceTask(), 1700);
    } else {
      state.tempMistakes++;
      showFeedback(false, "¡Casi! Probá cambiando el orden de las sílabas.");
      updatePioSpeech("¡Casi! Tocá una sílaba en la ranura para sacarla y ordenar de nuevo.", true);
    }
  }

  // 5. Sumas con soporte gráfico
  function renderVisualAdditionTask(task, container) {
    const visualCard = document.createElement('div');
    visualCard.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      background: #ffffff;
      border: 3px solid #cbd5e1;
      border-radius: var(--radius-md);
      padding: 18px 28px;
      margin-bottom: 26px;
      flex-wrap: wrap;
      box-shadow: var(--shadow-btn);
    `;

    const groupAEl = document.createElement('div');
    groupAEl.style.fontSize = '2.6rem';
    groupAEl.innerHTML = Array(task.groupA.count).fill(task.groupA.emoji).join(" ");

    const opEl = document.createElement('div');
    opEl.style.fontSize = '2.4rem';
    opEl.style.fontWeight = '800';
    opEl.style.color = '#38b000';
    opEl.textContent = "+";

    const groupBEl = document.createElement('div');
    groupBEl.style.fontSize = '2.6rem';
    groupBEl.innerHTML = Array(task.groupB.count).fill(task.groupB.emoji).join(" ");

    visualCard.appendChild(groupAEl);
    visualCard.appendChild(opEl);
    visualCard.appendChild(groupBEl);
    container.appendChild(visualCard);

    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';

    task.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-option-card';
      btn.innerHTML = `<span style="font-size: 1.9rem;">${opt.label}</span><span class="option-subword">${opt.word}</span>`;
      btn.onclick = () => handleChoiceAnswer(opt.val, task.correctVal, task.successText);
      optionsGrid.appendChild(btn);
    });

    container.appendChild(optionsGrid);
  }

  // 6. Restas con soporte gráfico
  function renderVisualSubtractionTask(task, container) {
    const wrap = document.createElement('div');
    wrap.style.cssText = `display: flex; flex-direction: column; align-items: center; width: 100%;`;

    const pen = document.createElement('div');
    pen.className = 'counting-farm-pen';
    pen.style.background = '#fef3c7';
    pen.style.borderColor = '#f59e0b';
    pen.title = "¡Tocá los elementos para tacharlos!";

    for (let i = 1; i <= task.initialCount; i++) {
      const item = document.createElement('div');
      item.className = 'countable-item';
      item.innerHTML = task.itemEmoji;

      item.onclick = () => {
        if (!item.dataset.crossed) {
          item.dataset.crossed = "true";
          item.style.filter = "grayscale(1) opacity(0.35)";
          item.style.transform = "scale(0.85)";
          SoundManager.playPop();
        } else {
          delete item.dataset.crossed;
          item.style.filter = "none";
          item.style.transform = "scale(1)";
          SoundManager.playPop();
        }
      };
      pen.appendChild(item);
    }
    wrap.appendChild(pen);

    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';

    task.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-option-card';
      btn.innerHTML = `<span style="font-size: 1.9rem;">${opt.label}</span><span class="option-subword">${opt.word}</span>`;
      btn.onclick = () => handleChoiceAnswer(opt.val, task.correctVal, task.successText);
      optionsGrid.appendChild(btn);
    });
    wrap.appendChild(optionsGrid);

    container.appendChild(wrap);
  }

  // 7. Billetes de $10 y Monedas de $1
  function renderMoneyTask(task, container) {
    const wrap = document.createElement('div');
    wrap.className = 'money-workshop';

    const priceCard = document.createElement('div');
    priceCard.className = 'price-tag-card';
    priceCard.innerHTML = `
      <div style="font-size: 3.2rem;">${task.productEmoji}</div>
      <div>
        <div style="font-size: 1.05rem; color: #7f1d1d; font-weight: 800;">${task.productName}</div>
        <div class="price-tag-val">$${task.targetPrice}</div>
      </div>
    `;
    wrap.appendChild(priceCard);

    let bills10Count = 0;
    let coins1Count = 0;

    const desks = document.createElement('div');
    desks.className = 'money-desks-grid';

    // Decenas ($10)
    const billsCol = document.createElement('div');
    billsCol.className = 'money-drawer-column';
    billsCol.innerHTML = `
      <div class="money-drawer-title">💵 Billetes de $10 (Decenas)</div>
      <div class="money-interactive-buttons">
        <button class="btn-add-money btn-add-bill" id="btnAddBill">+ Agregar $10</button>
      </div>
      <div class="money-items-display" id="billsDisplayArea" title="Tocá un billete para sacarlo">
        <span style="font-size: 0.95rem; color: #94a3b8;">Tocá "+ Agregar $10"</span>
      </div>
    `;

    // Unidades ($1)
    const coinsCol = document.createElement('div');
    coinsCol.className = 'money-drawer-column';
    coinsCol.innerHTML = `
      <div class="money-drawer-title">🪙 Monedas de $1 (Unidades)</div>
      <div class="money-interactive-buttons">
        <button class="btn-add-money btn-add-coin" id="btnAddCoin">+ Agregar $1</button>
      </div>
      <div class="money-items-display" id="coinsDisplayArea" title="Tocá una moneda para sacarla">
        <span style="font-size: 0.95rem; color: #94a3b8;">Tocá "+ Agregar $1"</span>
      </div>
    `;

    desks.appendChild(billsCol);
    desks.appendChild(coinsCol);
    wrap.appendChild(desks);

    const liveBar = document.createElement('div');
    liveBar.className = 'money-live-total-bar';
    liveBar.innerHTML = `
      <span>Tenés en la mesa:</span>
      <strong id="moneyCurrentTotal" style="font-size: 1.6rem; color: #0077b6;">$0</strong>
    `;
    wrap.appendChild(liveBar);

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn-action-submit';
    submitBtn.innerHTML = `🛒 ¡Pagar $${task.targetPrice}!`;
    submitBtn.onclick = () => {
      const currentTotal = (bills10Count * 10) + coins1Count;
      if (currentTotal === task.targetPrice) {
        SoundManager.playCoin();
        showFeedback(true, task.successText);
        updatePioSpeech(task.successText, true);
        setTimeout(() => advanceTask(), 1700);
      } else if (currentTotal < task.targetPrice) {
        state.tempMistakes++;
        const falta = task.targetPrice - currentTotal;
        showFeedback(false, `¡Todavía te faltan $${falta}! Agregá más dinero.`);
        updatePioSpeech(`Pusiste $${currentTotal}. Te faltan $${falta} para llegar a $${task.targetPrice}.`, true);
      } else {
        state.tempMistakes++;
        const sobra = currentTotal - task.targetPrice;
        showFeedback(false, `¡Pusiste de más! Sobran $${sobra}. Tocá un billete o moneda para retirarlo.`);
        updatePioSpeech(`Pusiste $${currentTotal}. Te sobran $${sobra}. Sacá lo que no necesitás.`, true);
      }
    };
    wrap.appendChild(submitBtn);

    container.appendChild(wrap);

    const btnAddBill = document.getElementById('btnAddBill');
    const btnAddCoin = document.getElementById('btnAddCoin');
    const billsArea = document.getElementById('billsDisplayArea');
    const coinsArea = document.getElementById('coinsDisplayArea');
    const totalDisplay = document.getElementById('moneyCurrentTotal');

    function updateMoneyUI() {
      const total = (bills10Count * 10) + coins1Count;
      totalDisplay.textContent = `$${total}`;

      billsArea.innerHTML = "";
      if (bills10Count === 0) {
        billsArea.innerHTML = `<span style="font-size: 0.95rem; color: #94a3b8;">Sin billetes</span>`;
      } else {
        for (let i = 0; i < bills10Count; i++) {
          const b = document.createElement('div');
          b.className = 'money-bill-token';
          b.innerHTML = `💵 $10 ✕`;
          b.onclick = () => {
            bills10Count--;
            SoundManager.playPop();
            updateMoneyUI();
          };
          billsArea.appendChild(b);
        }
      }

      coinsArea.innerHTML = "";
      if (coins1Count === 0) {
        coinsArea.innerHTML = `<span style="font-size: 0.95rem; color: #94a3b8;">Sin monedas</span>`;
      } else {
        for (let i = 0; i < coins1Count; i++) {
          const c = document.createElement('div');
          c.className = 'money-coin-token';
          c.innerHTML = `$1`;
          c.onclick = () => {
            coins1Count--;
            SoundManager.playPop();
            updateMoneyUI();
          };
          coinsArea.appendChild(c);
        }
      }
    }

    btnAddBill.onclick = () => {
      if (bills10Count < 7) {
        bills10Count++;
        SoundManager.playCoin();
        updateMoneyUI();
      }
    };

    btnAddCoin.onclick = () => {
      if (coins1Count < 9) {
        coins1Count++;
        SoundManager.playCoin();
        updateMoneyUI();
      }
    };
  }

  // 8. Comprensión lectora simple de oraciones breves
  function renderReadingCompTask(task, container) {
    const wrap = document.createElement('div');
    wrap.className = 'reading-comprehension-box';

    const sentenceCard = document.createElement('div');
    sentenceCard.className = 'story-sentence-card';
    sentenceCard.innerHTML = `<div class="story-sentence-text">"${task.sentence}"</div>`;
    wrap.appendChild(sentenceCard);

    const questionText = document.createElement('div');
    questionText.style.cssText = `
      font-size: 1.4rem;
      font-weight: 800;
      color: #1e3a8a;
      margin-bottom: 18px;
    `;
    questionText.textContent = task.question;
    wrap.appendChild(questionText);

    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';

    task.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-option-card';
      btn.style.minWidth = '170px';
      btn.innerHTML = `<span style="font-size: 1.3rem;">${opt.label}</span>`;
      btn.onclick = () => handleChoiceAnswer(opt.val, task.correctVal, task.successText);
      optionsGrid.appendChild(btn);
    });
    wrap.appendChild(optionsGrid);

    container.appendChild(wrap);
  }

  // 9. Secuencias numéricas y escalas
  function renderSequenceTask(task, container) {
    const wrap = document.createElement('div');
    wrap.style.cssText = `display: flex; flex-direction: column; align-items: center; width: 100%;`;

    const track = document.createElement('div');
    track.className = 'sequence-track';

    task.sequence.forEach(num => {
      const step = document.createElement('div');
      step.className = `sequence-step ${num === '?' ? 'target-blank' : ''}`;
      step.textContent = num;
      track.appendChild(step);
    });
    wrap.appendChild(track);

    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';

    task.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-option-card';
      btn.innerHTML = `<span style="font-size: 1.9rem;">${opt.label}</span>`;
      btn.onclick = () => handleChoiceAnswer(opt.val, task.correctVal, task.successText);
      optionsGrid.appendChild(btn);
    });
    wrap.appendChild(optionsGrid);

    container.appendChild(wrap);
  }

  /* ------------------------------------------------------------------------
     VALIDACIÓN Y TRANSICIÓN DE TAREAS
     ------------------------------------------------------------------------ */
  function handleChoiceAnswer(userVal, correctVal, successText) {
    if (userVal === correctVal) {
      showFeedback(true, successText);
      updatePioSpeech(successText, true);
      setTimeout(() => advanceTask(), 1600);
    } else {
      state.tempMistakes++;
      showFeedback(false, "¡Casi! Pensalo un poquito más y probá otra opción.");
      updatePioSpeech("¡Casi! Pensalo tranquilo y elegí otra opción.", true);
    }
  }

  function advanceTask() {
    const levelData = FarmCurriculumData[`level${state.currentLevelId}`];
    state.currentTaskIndex++;

    if (state.currentTaskIndex < levelData.tasks.length) {
      renderCurrentTask();
    } else {
      finishCurrentLevel();
    }
  }

  function finishCurrentLevel() {
    SoundManager.playFanfare();
    ConfettiEffect.launch(90);

    let earnedStars = 3;
    if (state.tempMistakes >= 3) {
      earnedStars = 1;
    } else if (state.tempMistakes >= 1) {
      earnedStars = 2;
    }

    if (earnedStars > (state.stars[state.currentLevelId] || 0)) {
      state.stars[state.currentLevelId] = earnedStars;
    }

    if (state.currentLevelId < 4 && state.unlockedLevel <= state.currentLevelId) {
      state.unlockedLevel = state.currentLevelId + 1;
    }

    saveState();
    updateHeaderUI();
    updateMapCardsUI();

    const modal = document.getElementById('levelCompleteModal');
    const starsRow = document.getElementById('completeStarsRow');
    const completeTitle = document.getElementById('completeTitle');
    const completeText = document.getElementById('completeText');

    completeTitle.textContent = `¡Nivel ${state.currentLevelId} Completado!`;
    starsRow.innerHTML = "";
    for (let s = 1; s <= 3; s++) {
      const star = document.createElement('span');
      star.textContent = "⭐";
      star.style.opacity = s <= earnedStars ? "1" : "0.2";
      starsRow.appendChild(star);
    }

    completeText.textContent = `¡Qué orgullo, ${state.playerName}! Conseguiste ${earnedStars} estrella${earnedStars > 1 ? 's' : ''} en este rincón.`;
    updatePioSpeech(`¡Felicitaciones ${state.playerName}! ¡Ganaste ${earnedStars} estrellas!`, true);

    const btnNext = document.getElementById('btnNextLevelModal');
    if (state.currentLevelId < 4) {
      btnNext.style.display = "inline-flex";
      btnNext.textContent = "¡Siguiente Nivel! ➡️";
      btnNext.onclick = () => {
        modal.classList.remove('active');
        startLevel(state.currentLevelId + 1);
      };
    } else {
      btnNext.style.display = "inline-flex";
      btnNext.textContent = "📜 ¡Ver Mi Gran Diploma!";
      btnNext.onclick = () => {
        modal.classList.remove('active');
        openDiplomaModal();
      };
    }

    document.getElementById('btnMapModal').onclick = () => {
      modal.classList.remove('active');
      showView('viewMap');
    };

    modal.classList.add('active');
  }

  function openDiplomaModal() {
    SoundManager.playFanfare();
    ConfettiEffect.launch(110);
    document.getElementById('diplomaPlayerName').textContent = state.playerName || "Estudiante";
    document.getElementById('diplomaModal').classList.add('active');
  }

  function setupGlobalEvents() {
    document.getElementById('btnLogoHome').onclick = () => {
      SpeechManager.stop();
      showView('viewMap');
    };

    document.getElementById('btnBackToMap').onclick = () => {
      SpeechManager.stop();
      showView('viewMap');
    };

    document.getElementById('btnSpeakPio').onclick = () => {
      triggerPioSpeak();
    };

    document.getElementById('btnPioAvatar').onclick = () => {
      SoundManager.playPioChirp();
      triggerPioSpeak();
    };

    // Música ON / OFF
    const btnMusic = document.getElementById('btnToggleMusic');
    const musicText = document.getElementById('musicBtnText');
    btnMusic.onclick = () => {
      const active = SoundManager.toggleMusic();
      if (active) {
        btnMusic.classList.add('active');
        musicText.textContent = "Música ON";
      } else {
        btnMusic.classList.remove('active');
        musicText.textContent = "Música OFF";
      }
    };

    // Modal de jugador
    const btnEditPlayer = document.getElementById('btnEditPlayer');
    const playerModal = document.getElementById('playerModal');
    const inputName = document.getElementById('inputPlayerName');
    const btnSaveName = document.getElementById('btnSavePlayerName');
    const avatarBtns = document.querySelectorAll('.avatar-option-btn');

    btnEditPlayer.onclick = () => {
      inputName.value = state.playerName || "";
      avatarBtns.forEach(b => {
        if (b.dataset.avatar === state.playerAvatar) b.classList.add('selected');
        else b.classList.remove('selected');
      });
      playerModal.classList.add('active');
      setTimeout(() => inputName.focus(), 100);
    };

    avatarBtns.forEach(btn => {
      btn.onclick = () => {
        avatarBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.playerAvatar = btn.dataset.avatar;
        SoundManager.playPop();
      };
    });

    btnSaveName.onclick = () => {
      const val = inputName.value.trim();
      if (val) {
        state.playerName = val;
        saveState();
        updateHeaderUI();
        updatePioSpeech(`¡Mucho gusto, ${state.playerName}! ¡Vamos a divertirnos aprendiendo!`, true);
      }
      playerModal.classList.remove('active');
    };

    inputName.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') btnSaveName.click();
    });

    document.getElementById('btnOpenDiploma').onclick = () => {
      openDiplomaModal();
    };

    document.getElementById('btnCloseDiploma').onclick = () => {
      document.getElementById('diplomaModal').classList.remove('active');
    };

    document.getElementById('btnResetProgress').onclick = () => {
      const conf = confirm("¿Querés reiniciar las estrellas y niveles para un nuevo estudiante?");
      if (conf) {
        localStorage.removeItem(STORAGE_KEY);
        state = {
          playerName: "Martín",
          playerAvatar: "👦",
          unlockedLevel: 1,
          stars: { 1: 0, 2: 0, 3: 0, 4: 0 },
          currentLevelId: 1,
          currentTaskIndex: 0,
          tempMistakes: 0
        };
        saveState();
        updateHeaderUI();
        updateMapCardsUI();
        showView('viewMap');
        showFeedback(true, "¡Juego reiniciado con éxito!");
      }
    };

    // PWA: Manejador de instalación (beforeinstallprompt)
    let deferredPrompt = null;
    const btnInstallPwa = document.getElementById('btnInstallPwa');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (btnInstallPwa) {
        btnInstallPwa.classList.add('visible');
      }
    });

    if (btnInstallPwa) {
      btnInstallPwa.onclick = async () => {
        if (!deferredPrompt) {
          alert('Para instalar en este dispositivo, tocá el menú de tu navegador (los tres puntos o botón Compartir) y elegí "Instalar aplicación" o "Agregar a la pantalla principal".');
          return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          btnInstallPwa.classList.remove('visible');
          showFeedback(true, '¡Instalando La Granja del Saber!');
        }
        deferredPrompt = null;
      };
    }

    window.addEventListener('appinstalled', () => {
      if (btnInstallPwa) btnInstallPwa.classList.remove('visible');
      updatePioSpeech('¡Qué alegría! Ahora La Granja del Saber está instalada en tu dispositivo para jugar cuando quieras sin internet.', true);
      showFeedback(true, '¡Aplicación instalada con éxito!');
    });
  }

  return {
    init,
    startLevel
  };
})();

// Registro de Service Worker para funcionamiento PWA sin internet
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('[PWA] Service Worker activo:', reg.scope))
        .catch((err) => console.warn('[PWA] Nota: el Service Worker requiere un servidor HTTP/HTTPS:', err));
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  GameController.init();
});
