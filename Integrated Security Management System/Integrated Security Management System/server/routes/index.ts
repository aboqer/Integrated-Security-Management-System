import { Router } from "express";
import { requireAuth } from "../auth";
import { authRouter } from "./auth";
import { referenceRouter } from "./reference";
import { peopleRouter } from "./people";
import { vehiclesRouter } from "./vehicles";
import { violationsRouter } from "./violations";
import { custodyRouter } from "./custody";
import { reportsRouter } from "./reports";
import { detaineesRouter } from "./detainees";
import { commitmentsRouter } from "./commitments";
import { attachmentsRouter } from "./attachments";
import { dashboardRouter } from "./dashboard";
import { auditRouter } from "./audit";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);

apiRouter.use("/reference", requireAuth, referenceRouter);
apiRouter.use("/people", requireAuth, peopleRouter);
apiRouter.use("/vehicles", requireAuth, vehiclesRouter);
apiRouter.use("/violations", requireAuth, violationsRouter);
apiRouter.use("/custody-records", requireAuth, custodyRouter);
apiRouter.use("/reports", requireAuth, reportsRouter);
apiRouter.use("/detainees", requireAuth, detaineesRouter);
apiRouter.use("/commitments", requireAuth, commitmentsRouter);
apiRouter.use("/attachments", requireAuth, attachmentsRouter);
apiRouter.use("/dashboard", requireAuth, dashboardRouter);
apiRouter.use("/audit-logs", requireAuth, auditRouter);
