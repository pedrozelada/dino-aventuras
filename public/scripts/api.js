const BASE_URL = "https://dinoapi.brunosouzadev.com/api/dinosaurs";

export async function getRandomDinosaur() {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("API no disponible");
    const data = await res.json();
    const random = data[Math.floor(Math.random() * data.length)];
    return random;
  } catch (error) {
    console.error("Error fetching dinosaurs:", error);
    // Fallback con imágenes online
    return getFallbackDinosaur();
  }
}

function getFallbackDinosaur() {
  const fallbackDinosaurs = [
    {
      name: "tiranosaurio rex",
      description: "El T-Rex fue uno de los depredadores más grandes que han existido, midiendo hasta 12 metros de largo.",
      image: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=400&h=400&fit=crop"
    },
    {
      name: "triceratops", 
      description: "Herbívoro con tres cuernos y un volante óseo que protegía su cuello.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
    },
    {
      name: "estegosaurio",
      description: "Reconocible por las placas en su espalda y púas en la cola.",
      image: "https://images.unsplash.com/photo-1598886307629-321d1d6c90d7?w=400&h=400&fit=crop"
    }
  ];
  
  return fallbackDinosaurs[Math.floor(Math.random() * fallbackDinosaurs.length)];
}

export async function getDinosaurByName(name) {
  try {
    const res = await fetch(`${BASE_URL}/${name}`);
    if (!res.ok) throw new Error("API no disponible");
    return await res.json();
  } catch (error) {
    console.error("Error fetching dinosaur by name:", error);
    return getFallbackDinosaur();
  }
}