export default {
  async fetch(request, env) {
    const allowedOrigin = "https://encuesta-app.analistasindependientes2020.workers.dev"; 

    // 1. SI ES UN GET, DEJAMOS PASAR LA PÁGINA WEB (index.html, css, etc)
    if (request.method === "GET") {
      // Le pedimos a Cloudflare que sirva el archivo estático correspondiente
      return env.ASSETS.fetch(request); 
    }

    // 2. Manejo de CORS para el formulario
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 3. Si no es POST (y no es GET), lo bloqueamos
    if (request.method !== "POST") {
      return new Response("Método no permitido", { status: 405 });
    }

    try {
      // 4. Procesamos el formulario
      const GOOGLE_URL = env.GOOGLE_URL;
      const SECRET_TOKEN = env.SECRET_TOKEN || "cardenal_amarillo"; // Si Cloudflare no lo lee, usa este por defecto

      if (!GOOGLE_URL || !SECRET_TOKEN) {
        throw new Error("Faltan las variables de entorno secretas en Cloudflare.");
      }

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
