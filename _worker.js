export default {
  async fetch(request, env) {
    const allowedOrigin = "https://encuesta-app.analistasindependientes2020.workers.dev"; 

    // 1. SI ES UN GET, DEVOLVEMOS EL HTML (Usando el CDN de GitHub o un fetch)
    if (request.method === "GET") {
      // Si estás usando el dominio de workers.dev, puedes hacer un fetch a tu GitHub Pages
      // O simplemente devolver un texto para probar:
      return new Response("El servidor está funcionando. Por favor, usá el formulario.", { 
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 2. Manejo de CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 3. Procesar POST
    try {
      const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbx_WOjsKJNIu_PvuoJF2hoR7a9gMx8PwGeKuUFApyeA-kXnERHwVPRv7_I7PyWqiRtXcA/exec"; 
      const SECRET_TOKEN = "cardenal_amarillo"; 

      const formData = await request.formData();
      formData.append("token", SECRET_TOKEN);

      const googleResponse = await fetch(GOOGLE_URL, {
        method: "POST",
        body: formData,
      });

      const data = await googleResponse.json();
      
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": allowedOrigin,
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ result: "error", message: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": allowedOrigin,
        },
      });
    }
  },
};
