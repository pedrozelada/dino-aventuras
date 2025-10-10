document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".menu-item");
  const content = document.getElementById("content-area");
  const menuContainer = document.querySelector(".menu-container");

  if (!content) {
    console.error("❌ No se encontró el elemento #content-area");
    return;
  }

  // Estilos para el área de contenido
  content.style.position = "fixed";
  content.style.top = "0";
  content.style.left = "0";
  content.style.width = "100%";
  content.style.height = "100%";
  content.style.zIndex = "200";
  content.style.display = "none";
  content.style.overflow = "auto";

  menuItems.forEach(item => {
    item.addEventListener("click", async e => {
      e.preventDefault();
      const id = item.id;

      if (id === "item-rompecabezas") {
        // Ocultar menú y mostrar contenido
        menuContainer.style.display = "none";
        content.style.display = "block";
        
        const { showPuzzleView } = await import("./puzzle.js");
        showPuzzleView(content);
      } else if (id === "item-aprender") {
        content.innerHTML = "<p>📚 Sección de aprendizaje próximamente</p>";
        menuContainer.style.display = "none";
        content.style.display = "block";
      } else {
        content.innerHTML = `<p>Sección "${item.textContent}" en desarrollo...</p>`;
        menuContainer.style.display = "none";
        content.style.display = "block";
      }
    });
  });

  // Función global para volver al menú
  window.returnToMenu = () => {
    content.style.display = "none";
    content.innerHTML = "";
    menuContainer.style.display = "flex";
  };
});