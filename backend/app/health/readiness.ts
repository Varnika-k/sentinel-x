import { Request, Response } from 'express';
import { checkGlobalHealth } from './health';

export async function handleReadiness(req: Request, res: Response): Promise<void> {
  try {
    const health = await checkGlobalHealth();
    
    // Readiness: We need both the database to be UP and event systems initialized.
    if (health.components.database.status === 'DOWN') {
      res.status(503).json({
        status: 'UNREADY',
        reason: 'Primary database initialization incomplete',
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
      components: health.components
    });
  } catch (error) {
    res.status(500).json({
      status: 'UNREADY',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
}
