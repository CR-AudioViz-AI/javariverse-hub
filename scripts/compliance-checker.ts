/**
 * Henderson Standards Compliance Checker
 * 
 * This script verifies that an app complies with all Henderson Standards:
 * - Central Services v3.1.0+
 * - Brand color compliance
 * - Mobile-first design
 * - E2E tests present
 * - Proper file structure
 * 
 * Run: npx ts-node compliance-checker.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ComplianceResult {
  passed: boolean;
  category: string;
  check: string;
  message: string;
}

const FORBIDDEN_COLORS = ['purple', 'violet', 'emerald', 'amber', 'pink', 'rose', 'indigo', 'fuchsia'];
const REQUIRED_CENTRAL_VERSION = '3.1.0';

function checkCentralServicesVersion(): ComplianceResult {
  const centralServicesPath = path.join(process.cwd(), 'lib', 'central-services.ts');
  
  if (!fs.existsSync(centralServicesPath)) {
    return {
      passed: false,
      category: 'Central Services',
      check: 'File exists',
      message: 'lib/central-services.ts not found'
    };
  }
  
  const content = fs.readFileSync(centralServicesPath, 'utf8');
  const versionMatch = content.match(/@version\s+(\d+\.\d+\.\d+)/);
  
  if (!versionMatch) {
    return {
      passed: false,
      category: 'Central Services',
      check: 'Version marker',
      message: 'No @version marker found'
    };
  }
  
  const version = versionMatch[1];
  const [major, minor] = version.split('.').map(Number);
  const [reqMajor, reqMinor] = REQUIRED_CENTRAL_VERSION.split('.').map(Number);
  
  if (major < reqMajor || (major === reqMajor && minor < reqMinor)) {
    return {
      passed: false,
      category: 'Central Services',
      check: 'Version',
      message: `Version ${version} is below required ${REQUIRED_CENTRAL_VERSION}`
    };
  }
  
  return {
    passed: true,
    category: 'Central Services',
    check: 'Version',
    message: `Version ${version} meets requirements`
  };
}

function checkE2ETests(): ComplianceResult {
  const e2ePath = path.join(process.cwd(), 'e2e');
  
  if (!fs.existsSync(e2ePath)) {
    return {
      passed: false,
      category: 'Testing',
      check: 'E2E directory',
      message: 'e2e/ directory not found'
    };
  }
  
  const files = fs.readdirSync(e2ePath);
  const testFiles = files.filter(f => f.endsWith('.spec.ts') || f.endsWith('.test.ts'));
  
  if (testFiles.length === 0) {
    return {
      passed: false,
      category: 'Testing',
      check: 'E2E tests',
      message: 'No test files found in e2e/'
    };
  }
  
  return {
    passed: true,
    category: 'Testing',
    check: 'E2E tests',
    message: `Found ${testFiles.length} test file(s)`
  };
}

function checkPlaywrightConfig(): ComplianceResult {
  const configPath = path.join(process.cwd(), 'playwright.config.ts');
  
  if (!fs.existsSync(configPath)) {
    return {
      passed: false,
      category: 'Testing',
      check: 'Playwright config',
      message: 'playwright.config.ts not found'
    };
  }
  
  const content = fs.readFileSync(configPath, 'utf8');
  const hasMobileProject = content.includes('375') || content.includes('mobile');
  
  if (!hasMobileProject) {
    return {
      passed: false,
      category: 'Testing',
      check: 'Mobile testing',
      message: 'No mobile viewport testing configured'
    };
  }
  
  return {
    passed: true,
    category: 'Testing',
    check: 'Playwright config',
    message: 'Configuration includes mobile testing'
  };
}

function checkBrandColors(): ComplianceResult[] {
  const results: ComplianceResult[] = [];
  const componentsDir = path.join(process.cwd(), 'components');
  const appDir = path.join(process.cwd(), 'app');
  
  const checkDir = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { recursive: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.toString());
      
      if (fs.statSync(filePath).isDirectory()) continue;
      if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) continue;
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const color of FORBIDDEN_COLORS) {
        if (content.includes(`bg-${color}`) || 
            content.includes(`text-${color}`) || 
            content.includes(`border-${color}`)) {
          results.push({
            passed: false,
            category: 'Brand Colors',
            check: file.toString(),
            message: `Forbidden color '${color}' found`
          });
        }
      }
    }
  };
  
  checkDir(componentsDir);
  checkDir(appDir);
  
  if (results.length === 0) {
    results.push({
      passed: true,
      category: 'Brand Colors',
      check: 'All files',
      message: 'No forbidden colors found'
    });
  }
  
  return results;
}

async function runComplianceCheck() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('         HENDERSON STANDARDS COMPLIANCE CHECKER            ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  const results: ComplianceResult[] = [
    checkCentralServicesVersion(),
    checkE2ETests(),
    checkPlaywrightConfig(),
    ...checkBrandColors()
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} | ${result.category} | ${result.check}`);
    console.log(`       ${result.message}`);
    console.log('');
    
    if (result.passed) passed++;
    else failed++;
  }
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════');
  
  process.exit(failed > 0 ? 1 : 0);
}

runComplianceCheck();
