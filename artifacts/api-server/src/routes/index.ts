import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import workersRouter from "./workers.js";
import companiesRouter from "./companies.js";
import requirementsRouter from "./requirements.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(workersRouter);
router.use(companiesRouter);
router.use(requirementsRouter);
router.use(adminRouter);

export default router;
