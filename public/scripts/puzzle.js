// public/scripts/puzzle.js
import { getRandomDinosaur } from "./api.js";

export async function showPuzzleView(container) {
  try {
    container.innerHTML = `
      <div class="puzzle-overlay">
        <section class="puzzle-view">
          <h2>Cargando dinosaurio...</h2>
          <div id="puzzle-loading">🦕 Cargando...</div>
          <button id="back-btn">🔙 Volver al menú</button>
        </section>
      </div>
    `;

    document.getElementById("back-btn").onclick = window.returnToMenu;

    const dino = await getRandomDinosaur();
    
    if (!dino || !dino.image) {
      throw new Error("No se pudo cargar la información del dinosaurio");
    }

    container.innerHTML = `
      <div class="puzzle-overlay">
        <section class="puzzle-view">
          <h2>Rompecabezas: ${capitalize(dino.name)}</h2>
          <p>${dino.description || "Intenta armar la imagen del dinosaurio."}</p>
          <div class="puzzle-controls">
            <label>Dificultad: </label>
            <select id="difficulty">
              <option value="3">Fácil (3x3)</option>
              <option value="4" selected>Normal (4x4)</option>
              <option value="5">Difícil (5x5)</option>
            </select>
            <button id="shuffle-btn">🔀 Mezclar</button>
          </div>
          <div id="puzzle-container"></div>
          <button id="back-btn">🔙 Volver al menú</button>
          <audio id="win-sound" src="public/sounds/win.mp3" preload="auto"></audio>
        </section>
      </div>
    `;

    const img = new Image();
    img.onload = () => {
      const difficulty = parseInt(document.getElementById("difficulty").value);
      initPuzzle(container.querySelector("#puzzle-container"), img, difficulty);
    };
    img.onerror = () => {
      container.querySelector("#puzzle-container").innerHTML = 
        "<p>Error al cargar la imagen. Intenta nuevamente.</p>";
    };
    img.src = dino.image;

    document.getElementById("back-btn").onclick = window.returnToMenu;
    document.getElementById("shuffle-btn").onclick = () => {
      const difficulty = parseInt(document.getElementById("difficulty").value);
      initPuzzle(container.querySelector("#puzzle-container"), img, difficulty);
    };
    
    document.getElementById("difficulty").addEventListener("change", () => {
      const difficulty = parseInt(document.getElementById("difficulty").value);
      initPuzzle(container.querySelector("#puzzle-container"), img, difficulty);
    });
    
  } catch (error) {
    console.error("Error en showPuzzleView:", error);
    container.innerHTML = `
      <div class="puzzle-overlay">
        <section class="puzzle-view">
          <h2>Error</h2>
          <p>No se pudo cargar el rompecabezas. Intenta nuevamente.</p>
          <button id="back-btn">🔙 Volver al menú</button>
        </section>
      </div>
    `;
    document.getElementById("back-btn").onclick = window.returnToMenu;
  }
}

function initPuzzle(container, img, size = 4) {
  const pieceSize = 100; // Tamaño fijo para cada pieza
  const totalPieces = size * size;
  
  // Limpiar contenedor
  container.innerHTML = '';
  
  // Configurar grid
  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${size}, ${pieceSize}px)`;
  container.style.gridTemplateRows = `repeat(${size}, ${pieceSize}px)`;
  container.style.gap = "2px";
  container.style.margin = "20px auto";
  container.style.justifyContent = "center";
  container.style.border = "3px solid #4C6A48";
  container.style.borderRadius = "8px";
  container.style.background = "#4C6A48";
  container.style.padding = "5px";

  // Crear array de posiciones y mezclar
  const positions = [];
  for (let i = 0; i < totalPieces; i++) {
    positions.push(i);
  }
  shuffle(positions);

  // Crear piezas
  const pieces = [];
  for (let i = 0; i < totalPieces; i++) {
    const piece = document.createElement("div");
    piece.className = "puzzle-piece";
    piece.draggable = true;
    
    // Posición actual (mezclada)
    const currentPos = positions[i];
    // Posición correcta
    const correctPos = i;
    
    piece.dataset.currentPos = currentPos;
    piece.dataset.correctPos = correctPos;
    piece.dataset.index = i;
    
    // Calcular posición del background
    const correctX = (correctPos % size) * pieceSize;
    const correctY = Math.floor(correctPos / size) * pieceSize;
    
    piece.style.width = `${pieceSize}px`;
    piece.style.height = `${pieceSize}px`;
    piece.style.backgroundImage = `url(${img.src})`;
    piece.style.backgroundSize = `${size * pieceSize}px ${size * pieceSize}px`;
    piece.style.backgroundPosition = `-${correctX}px -${correctY}px`;
    piece.style.cursor = "grab";
    piece.style.borderRadius = "4px";
    piece.style.transition = "transform 0.2s";
    
    // Si es la última pieza (espacio vacío)
    if (currentPos === totalPieces - 1) {
      piece.style.backgroundColor = "#2C3E50";
      piece.style.backgroundImage = "none";
      piece.dataset.empty = "true";
    }
    
    container.appendChild(piece);
    pieces.push(piece);
  }

  enableDragAndDrop(container, pieces, size);
}

function enableDragAndDrop(container, pieces, size) {
  let draggedPiece = null;

  pieces.forEach(piece => {
    piece.addEventListener("dragstart", (e) => {
      if (piece.dataset.empty === "true") {
        e.preventDefault();
        return;
      }
      draggedPiece = piece;
      piece.style.opacity = "0.6";
      piece.style.transform = "scale(1.05)";
      e.dataTransfer.setData('text/plain', piece.dataset.index);
    });
    
    piece.addEventListener("dragend", () => {
      if (draggedPiece) {
        draggedPiece.style.opacity = "1";
        draggedPiece.style.transform = "scale(1)";
        draggedPiece = null;
      }
    });
    
    piece.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    
    piece.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedPiece || piece === draggedPiece || piece.dataset.empty !== "true") {
        return;
      }
      
      // Intercambiar posiciones
      swapPieces(draggedPiece, piece, container, size);
    });
  });
}

function swapPieces(pieceA, pieceB, container, size) {
  // Intercambiar datos de posición
  const tempPos = pieceA.dataset.currentPos;
  pieceA.dataset.currentPos = pieceB.dataset.currentPos;
  pieceB.dataset.currentPos = tempPos;
  
  // Intercambiar en el DOM (mantener el orden visual)
  const temp = document.createElement('div');
  container.insertBefore(temp, pieceA);
  container.insertBefore(pieceA, pieceB);
  container.insertBefore(pieceB, temp);
  container.removeChild(temp);
  
  // Verificar si se ganó
  checkWin(container, size);
}

function checkWin(container, size) {
  const pieces = Array.from(container.children);
  let isWin = true;
  
  for (let i = 0; i < pieces.length - 1; i++) {
    const piece = pieces[i];
    const currentPos = parseInt(piece.dataset.currentPos);
    const correctPos = parseInt(piece.dataset.correctPos);
    
    if (currentPos !== correctPos) {
      isWin = false;
      break;
    }
  }
  
  if (isWin) {
    // Mostrar animación de victoria
    pieces.forEach(piece => {
      piece.style.transition = "all 0.5s";
      piece.style.transform = "scale(1.1)";
      piece.style.boxShadow = "0 0 20px gold";
    });
    
    setTimeout(() => {
      try {
        const winSound = document.getElementById("win-sound");
        if (winSound) {
          winSound.play().catch(e => console.log("Error reproduciendo sonido:", e));
        }
      } catch (error) {
        console.log("Error con el sonido:", error);
      }
      
      alert("🎉 ¡Felicidades! ¡Completaste el rompecabezas!");
      
      // Restaurar estilos
      pieces.forEach(piece => {
        piece.style.transform = "scale(1)";
        piece.style.boxShadow = "none";
      });
    }, 500);
  }
}

function shuffle(arr) {
  // Algoritmo Fisher-Yates para mezclar
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}