export default {
  async fetch(request, env) {
    // 1. Manejo de CORS
    const allowedOrigin = "https://encuesta-app.analistasindependientes2020.workers.dev"; 

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Método no permitido", { status: 405 });
    }

    try {
      // 2. Leemos los secretos de Cloudflare
      const GOOGLE_URL = env.GOOGLE_URL;
      const SECRET_TOKEN = env.SECRET_TOKEN;

      if (!GOOGLE_URL || !SECRET_TOKEN) {
        throw new Error("Faltan las variables de entorno secretas en Cloudflare.");
      }

      // 3. Preparamos los datos
      const formData = await request.formData();
      formData.append("token", SECRET_TOKEN);

      // 4. Reenviamos a Google
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
