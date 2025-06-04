import { config } from "dotenv";
config();
import app from "./app";
import { createServer } from "http";

async function main(): Promise<void> {
  try {

    // Inicialización del servidor
    const httpServer = createServer(app);
    
    //escucha del servidor en puerto 8001
    const port = Number(process.env.PORT || 3000);
    
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
    
  } catch (error) {
    console.error("Error during application initialization:", error);
    process.exit(1); // Salir del proceso si ocurre un error crítico
  }
}
main();
