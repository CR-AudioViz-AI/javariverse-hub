/**
 * CR AudioViz AI Ecosystem Health Check
 * 
 * Monitors all systems:
 * - Scrapers status
 * - Javari learning
 * - Self-healing
 * - App connections
 * - Affiliate tracking
 * - Data freshness
 */

import { CoreConsole } from './core-console-api';
import { SCRAPER_CONFIGS } from './scraper-config';
import { AFFILIATE_PROGRAMS } from './affiliate-config';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  lastCheck: Date;
  details: Record<string, any>;
}

interface EcosystemHealth {
  overall: HealthStatus['status'];
  components: {
    scrapers: HealthStatus;
    javariLearning: HealthStatus;
    selfHealing: HealthStatus;
    appConnections: HealthStatus;
    affiliates: HealthStatus;
    dataFreshness: HealthStatus;
  };
}

export class EcosystemHealthChecker {
  /**
   * Run full ecosystem health check
   */
  async checkHealth(): Promise<EcosystemHealth> {
    const [scrapers, learning, healing, connections, affiliates, freshness] = await Promise.all([
      this.checkScrapers(),
      this.checkJavariLearning(),
      this.checkSelfHealing(),
      this.checkAppConnections(),
      this.checkAffiliates(),
      this.checkDataFreshness(),
    ]);

    // Calculate overall status
    const statuses = [scrapers, learning, healing, connections, affiliates, freshness].map(c => c.status);
    let overall: HealthStatus['status'] = 'healthy';
    if (statuses.includes('critical')) overall = 'critical';
    else if (statuses.includes('degraded')) overall = 'degraded';

    return {
      overall,
      components: {
        scrapers,
        javariLearning: learning,
        selfHealing: healing,
        appConnections: connections,
        affiliates,
        dataFreshness: freshness,
      },
    };
  }

  /**
   * Check scraper health
   */
  async checkScrapers(): Promise<HealthStatus> {
    try {
      const status = await CoreConsole.Scrapers.getStatus();
      const enabledScrapers = SCRAPER_CONFIGS.filter(s => s.enabled).length;
      const runningScrapers = status.filter((s: any) => s.status === 'running' || s.status === 'idle').length;
      const errorScrapers = status.filter((s: any) => s.status === 'error').length;

      let healthStatus: HealthStatus['status'] = 'healthy';
      if (errorScrapers > 0) healthStatus = errorScrapers > 2 ? 'critical' : 'degraded';

      return {
        status: healthStatus,
        lastCheck: new Date(),
        details: {
          enabled: enabledScrapers,
          running: runningScrapers,
          errors: errorScrapers,
          configs: SCRAPER_CONFIGS.map(s => ({ id: s.id, name: s.name, enabled: s.enabled })),
        },
      };
    } catch (error) {
      return {
        status: 'critical',
        lastCheck: new Date(),
        details: { error: String(error) },
      };
    }
  }

  /**
   * Check Javari learning system
   */
  async checkJavariLearning(): Promise<HealthStatus> {
    try {
      const knowledgeStatus = await CoreConsole.Javari.getKnowledgeStatus();
      const lastUpdateAge = Date.now() - new Date(knowledgeStatus.lastUpdate).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      let healthStatus: HealthStatus['status'] = 'healthy';
      if (lastUpdateAge > maxAge * 2) healthStatus = 'critical';
      else if (lastUpdateAge > maxAge) healthStatus = 'degraded';

      return {
        status: healthStatus,
        lastCheck: new Date(),
        details: {
          totalDocuments: knowledgeStatus.totalDocuments,
          lastUpdate: knowledgeStatus.lastUpdate,
          updateAgeHours: Math.round(lastUpdateAge / (60 * 60 * 1000)),
          categories: knowledgeStatus.categories,
        },
      };
    } catch (error) {
      return {
        status: 'degraded',
        lastCheck: new Date(),
        details: { error: String(error) },
      };
    }
  }

  /**
   * Check self-healing system
   */
  async checkSelfHealing(): Promise<HealthStatus> {
    try {
      // Check if autonomous system is running
      const response = await fetch('https://craudiovizai.com/api/autonomous/status');
      const status = await response.json();

      return {
        status: status.running ? 'healthy' : 'degraded',
        lastCheck: new Date(),
        details: {
          running: status.running,
          lastHealing: status.lastHealing,
          issuesFixed: status.issuesFixed || 0,
          pendingIssues: status.pendingIssues || 0,
        },
      };
    } catch (error) {
      return {
        status: 'degraded',
        lastCheck: new Date(),
        details: { error: String(error) },
      };
    }
  }

  /**
   * Check app connections
   */
  async checkAppConnections(): Promise<HealthStatus> {
    const apps = [
      'javari-market', 'mortgage-rate-monitor', 'javari-cards', 
      'crochet-platform', 'javari-realty', 'javari-ai',
    ];

    const results: Record<string, boolean> = {};
    let failures = 0;

    for (const app of apps) {
      try {
        const response = await fetch(`https://${app}.vercel.app/api/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        results[app] = response.ok;
        if (!response.ok) failures++;
      } catch {
        results[app] = false;
        failures++;
      }
    }

    let healthStatus: HealthStatus['status'] = 'healthy';
    if (failures > apps.length / 2) healthStatus = 'critical';
    else if (failures > 0) healthStatus = 'degraded';

    return {
      status: healthStatus,
      lastCheck: new Date(),
      details: {
        totalApps: apps.length,
        healthyApps: apps.length - failures,
        failures,
        results,
      },
    };
  }

  /**
   * Check affiliate system
   */
  async checkAffiliates(): Promise<HealthStatus> {
    try {
      const earnings = await CoreConsole.Affiliates.getEarnings();
      
      return {
        status: 'healthy',
        lastCheck: new Date(),
        details: {
          totalPrograms: AFFILIATE_PROGRAMS.length,
          activePrograms: AFFILIATE_PROGRAMS.filter(p => p.apps.length > 0).length,
          recentEarnings: earnings,
          coveringCosts: earnings.total >= 0, // Will need real calculation
        },
      };
    } catch (error) {
      return {
        status: 'degraded',
        lastCheck: new Date(),
        details: { error: String(error) },
      };
    }
  }

  /**
   * Check data freshness across sectors
   */
  async checkDataFreshness(): Promise<HealthStatus> {
    const freshness: Record<string, { age: number; stale: boolean }> = {};
    let staleCount = 0;

    const checks = [
      { name: 'mortgageRates', maxAge: 4 * 60 * 60 * 1000 }, // 4 hours
      { name: 'collectorPrices', maxAge: 6 * 60 * 60 * 1000 }, // 6 hours
      { name: 'stockData', maxAge: 30 * 60 * 1000 }, // 30 min during market hours
      { name: 'cryptoData', maxAge: 10 * 60 * 1000 }, // 10 min
    ];

    for (const check of checks) {
      try {
        const data = await CoreConsole.CrossSector.getSectorData(
          check.name.includes('mortgage') ? 'financial' : 'collectors',
          check.name.includes('mortgage') ? 'rates' : 'prices',
          { limit: 1 }
        );
        const age = data?.[0]?.updated_at 
          ? Date.now() - new Date(data[0].updated_at).getTime()
          : Infinity;
        const stale = age > check.maxAge;
        freshness[check.name] = { age, stale };
        if (stale) staleCount++;
      } catch {
        freshness[check.name] = { age: Infinity, stale: true };
        staleCount++;
      }
    }

    let healthStatus: HealthStatus['status'] = 'healthy';
    if (staleCount > checks.length / 2) healthStatus = 'critical';
    else if (staleCount > 0) healthStatus = 'degraded';

    return {
      status: healthStatus,
      lastCheck: new Date(),
      details: { freshness, staleCount },
    };
  }
}

// Auto-run health checks
export async function runHealthCheck() {
  const checker = new EcosystemHealthChecker();
  const health = await checker.checkHealth();
  
  console.log('=== CR AudioViz AI Ecosystem Health ===');
  console.log(`Overall: ${health.overall}`);
  console.log('Components:');
  Object.entries(health.components).forEach(([name, status]) => {
    console.log(`  ${name}: ${status.status}`);
  });
  
  return health;
}

export default EcosystemHealthChecker;
