import { Request, Response } from 'express';

export function handleLiveness(req: Request, res: Response): void {
  // Liveness check merely confirms that the process is alive and receiving requests
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString()
  });
}
