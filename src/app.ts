import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import GestionHistorialRouter from "./routes/gestion.routes";
import AuthRouter from "./routes/auth.routes";
import HistorialUserslRouter from "./routes/historial_users.routes";
import tiempollamadaRouter from "./routes/tiempollamada.routes";
import ReporteRouter from "./routes/reporte.routes";
import DetalleRouter from "./routes/detalle_agente.routes";
import TiemposMuertosRouter from "./routes/tiempos-muertos.routes";
import UsuariosRouter from "./routes/usuarios.routes";
import CampaignRouter from "./routes/campaign.routes";
import listsRouter from "./routes/lists.routes";
import ReasignacionesRouter from "./routes/reasignaciones.routes";
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
        origin: "*",
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      })
    );
    //this.server.options("*", cors());
    this.server.use(express.json());
    
    //this.server.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    // Rutas de la API
    this.server.use("/api/llamadas", tiempollamadaRouter)
    this.server.use("/api/gestion", GestionHistorialRouter);
    this.server.use("/api/auth", AuthRouter);
    this.server.use("/api/log", DetalleRouter);
    this.server.use("/api/usuario_historial", HistorialUserslRouter)
    this.server.use("/api/tiemposMuertos", TiemposMuertosRouter)
    this.server.use("/api/reportes", ReporteRouter)
    this.server.use("/api/usuarios", UsuariosRouter)
    this.server.use("/api/campaigns", CampaignRouter)
    this.server.use("/api/lists", listsRouter)
    this.server.use("/api/reasignaciones", ReasignacionesRouter)
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
