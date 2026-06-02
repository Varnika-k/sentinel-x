import { logger } from './logger';

export type DeploymentProfile = 'local' | 'demo' | 'staging' | 'production';

export interface AppConfig {
  profile: DeploymentProfile;
  port: number;
  database: {
    url?: string;
    poolMax: number;
  };
  redis: {
    url?: string;
  };
  gemini: {
    apiKey?: string;
    modelName: string;
  };
  featureFlags: {
    enableDeepLearningSimulation: boolean;
    enableLiveMitigationResponse: boolean;
    enableMockContinuousTelemetry: boolean;
    strictSecurityAuditLogging: boolean;
  };
}

class ConfigurationManager {
  private static instance: ConfigurationManager;
  private currentConfig!: AppConfig;

  private constructor() {
    this.loadConfiguration();
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  private loadConfiguration() {
    const rawProfile = (process.env.DEPLOYMENT_PROFILE || process.env.NODE_ENV || 'local').toLowerCase();
    let profile: DeploymentProfile = 'local';
    if (['local', 'demo', 'staging', 'production'].includes(rawProfile)) {
      profile = rawProfile as DeploymentProfile;
    } else if (rawProfile === 'development') {
      profile = 'local';
    }

    const port = Number(process.env.PORT) || 3000;
    const databaseUrl = process.env.DATABASE_URL;
    const redisUrl = process.env.REDIS_URL;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // Default configuration template
    const config: AppConfig = {
      profile,
      port,
      database: {
        url: databaseUrl,
        poolMax: Number(process.env.DB_POOL_MAX) || 15
      },
      redis: {
        url: redisUrl
      },
      gemini: {
        apiKey: geminiApiKey,
        modelName: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      },
      featureFlags: {
        enableDeepLearningSimulation: true,
        enableLiveMitigationResponse: true,
        enableMockContinuousTelemetry: true,
        strictSecurityAuditLogging: true
      }
    };

    // Profile customizations
    if (profile === 'production') {
      config.featureFlags.enableMockContinuousTelemetry = false;
      config.featureFlags.strictSecurityAuditLogging = true;
    } else if (profile === 'demo') {
      config.featureFlags.enableMockContinuousTelemetry = true;
      config.featureFlags.enableLiveMitigationResponse = true;
    }

    this.currentConfig = config;
    logger.info(`[ConfigurationManager] Loaded profile [${profile.toUpperCase()}] successfully. Port ${config.port}`);
    this.validateEnvironment();
  }

  private validateEnvironment() {
    if (this.currentConfig.profile === 'production') {
      if (!this.currentConfig.database.url) {
        logger.warn('[ConfigurationManager] Validation Warning: DATABASE_URL not detected in production environment profile!');
      }
      if (!this.currentConfig.redis.url) {
        logger.warn('[ConfigurationManager] Validation Warning: REDIS_URL not detected in production environment profile! Local fallback will trigger.');
      }
      if (!this.currentConfig.gemini.apiKey) {
        logger.warn('[ConfigurationManager] Validation Warning: GEMINI_API_KEY not detected in production environment profile!');
      }
    }
  }

  public get(): AppConfig {
    return this.currentConfig;
  }

  public isFeatureEnabled(flag: keyof AppConfig['featureFlags']): boolean {
    return this.currentConfig.featureFlags[flag];
  }
}

export const configurationManager = ConfigurationManager.getInstance();
export const config = configurationManager.get();
