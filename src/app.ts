import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import GestionHistorialRouter from "./routes/gestion_historial.routes";
import AuthRouter from "./routes/auth.routes";

class App {
  private server: Application;

  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    // Configuración de CORS
    
    this.server.use(
      cors({
        origin: "http://localhost:4200",
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      })
    );
    //this.server.options("*", cors());
    this.server.use(express.json());
    
    //this.server.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    // Rutas de la API
    this.server.use("/api/gestion_historial", GestionHistorialRouter);
    this.server.use("/api/auth", AuthRouter);

    // Ruta de prueba
    this.server.get("/health", (req: Request, res: Response) => {
      res.status(200).json({ status: "ok", message: "Server is running" });
    });

    // Manejo de errores 404
    this.server.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({ error: "Ruta no encontrada" });
    });
  }

  public getServer(): Application {
    return this.server;
  }
}

export default new App().getServer();
