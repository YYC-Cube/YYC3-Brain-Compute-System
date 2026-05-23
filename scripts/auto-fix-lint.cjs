#!/usr/bin/env node

/**
 * ESLint Technical Debt Auto-Fixer v2.0
 * 
 * 智能修复策略:
 * 1. 删除未使用的导入语句 (import)
 * 2. 重命名未使用参数 (_prefix)
 * 3. 移除空catch块参数
 * 4. 清理console.log语句
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m',   // red
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function getLintErrors() {
  try {
    const output = execSync(
      `npx eslint "${PROJECT_ROOT}/src" --format json --no-error-on-unmatched-pattern 2>/dev/null`,
      { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );
    return JSON.parse(output);
  } catch (error) {
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}

function categorizeWarnings(results) {
  const categories = {
    unusedImports: [],      // 未使用的导入
    unusedParams: [],       // 未使用的函数参数
    unusedVars: [],         // 未使用的变量
    consoleLogs: [],        // console.log
    anyTypes: [],           // any类型
  };

  results.forEach(file => {
    if (!file.messages) return;
    
    file.messages.forEach(msg => {
      const warning = {
        file: file.filePath,
        line: msg.line,
        column: msg.column,
        message: msg.message,
        ruleId: msg.ruleId,
      };

      if (msg.ruleId === 'no-unused-vars' || msg.ruleId === '@typescript-eslint/no-unused-vars') {
        if (msg.message.includes("import")) {
          categories.unusedImports.push(warning);
        } else if (msg.message.includes("'") && (
          msg.message.includes("is defined but never used") ||
          msg.message.includes("is assigned a value but never used")
        )) {
          // 判断是参数还是变量
          const varName = extractVarName(msg.message);
          if (isLikelyParameter(file.filePath, msg.line, varName)) {
            categories.unusedParams.push(warning);
          } else {
            categories.unusedVars.push(warning);
          }
        }
      } else if (msg.ruleId === 'no-console') {
        categories.consoleLogs.push(warning);
      } else if (msg.ruleId === '@typescript-eslint/no-explicit-any') {
        categories.anyTypes.push(warning);
      }
    });
  });

  return categories;
}

function extractVarName(message) {
  const match = message.match(/'([^']+)'/);
  return match ? match[1] : null;
}

function isLikelyParameter(filePath, lineNumber, varName) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const line = lines[lineNumber - 1];
    
    // 检查是否在函数定义中
    const paramPatterns = [
      /\([^)]*\)\s*=>/,                    // 箭头函数
      /function\s*\w*\s*\([^)]*\)/,        // 函数声明
      /\.\w+\s*\(\s*[^)]*\)\s*{/,          // 方法调用
      /catch\s*\(/,                        // catch块
    ];
    
    for (const pattern of paramPatterns) {
      if (pattern.test(line)) {
        return true;
      }
    }

    // 检查前几行是否是函数定义
    for (let i = Math.max(0, lineNumber - 3); i < lineNumber; i++) {
      const prevLine = lines[i];
      if (prevLine && paramPatterns.some(p => p.test(prevLine))) {
        return true;
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

function fixUnusedImports(warnings) {
  let fixedCount = 0;
  
  warnings.forEach(warning => {
    try {
      const content = fs.readFileSync(warning.file, 'utf-8');
      const lines = content.split('\n');
      const lineIndex = warning.line - 1;
      
      if (lineIndex < 0 || lineIndex >= lines.length) return;

      const line = lines[lineIndex];
      const varName = extractVarName(warning.message);

      if (!varName || !line.includes(varName)) return;

      // 处理多变量导入: import { a, b, c } from 'module'
      const importMatch = line.match(/import\s*\{([^}]*)\}\s*from/);
      if (importMatch) {
        const imports = importMatch[1]
          .split(',')
          .map(imp => imp.trim())
          .filter(imp => imp !== varName && !imp.startsWith(`${varName} `) && !imp.startsWith(`${varName},`));

        if (imports.length === 0) {
          // 删除整行（如果是空导入）
          lines[lineIndex] = '';
        } else {
          // 从导入列表中移除该变量
          lines[lineIndex] = line.replace(
            /\{[^}]*\}/,
            `{ ${imports.join(', ')} }`
          );
        }
        
        fs.writeFileSync(warning.file, lines.join('\n'), 'utf-8');
        fixedCount++;
        log(`✅ Removed unused import: ${varName} in ${path.relative(PROJECT_ROOT, warning.file)}`, 'success');
      }
    } catch (error) {
      log(`❌ Failed to fix import in ${warning.file}: ${error.message}`, 'error');
    }
  });

  return fixedCount;
}

function fixUnusedParams(warnings) {
  let fixedCount = 0;

  // 按文件分组，从后往前处理避免行号偏移
  const warningsByFile = {};
  warnings.forEach(w => {
    if (!warningsByFile[w.file]) warningsByFile[w.file] = [];
    warningsByFile[w.file].push(w);
  });

  Object.entries(warningsByFile).forEach(([filePath, fileWarnings]) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      let modifiedContent = content;

      // 按行号降序排序
      fileWarnings.sort((a, b) => b.line - a.line);

      fileWarnings.forEach(warning => {
        const varName = extractVarName(warning.message);
        if (!varName) return;

        // 使用正则替换变量名（添加下划线前缀）
        const lines = modifiedContent.split('\n');
        const lineIndex = warning.line - 1;
        
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const line = lines[lineIndex];
          
          // 只替换当前行中的变量名（避免影响其他行）
          const newLine = line.replaceAll(new RegExp(`\\b${varName}\\b`, 'g'), `_${varName}`);
          lines[lineIndex] = newLine;
          
          modifiedContent = lines.join('\n');
          fixedCount++;
        }
      });

      if (modifiedContent !== content) {
        fs.writeFileSync(filePath, modifiedContent, 'utf-8');
        log(`✅ Renamed ${fileWarnings.length} params in ${path.relative(PROJECT_ROOT, filePath)}`, 'success');
      }
    } catch (error) {
      log(`❌ Failed to fix params in ${filePath}: ${error.message}`, 'error');
    }
  });

  return fixedCount;
}

function fixConsoleLogs(warnings) {
  let fixedCount = 0;

  warnings.forEach(warning => {
    try {
      const content = fs.readFileSync(warning.file, 'utf-8');
      const lines = content.split('\n');
      const lineIndex = warning.line - 1;

      if (lineIndex < 0 || lineIndex >= lines.length) return;

      const line = lines[lineIndex];

      // 删除或注释掉console.log行
      if (line.trim().startsWith('console.')) {
        lines[lineIndex] = `// [REMOVED] ${line.trim()}`;
        fs.writeFileSync(warning.file, lines.join('\n'), 'utf-8');
        fixedCount++;
        log(`🗑️ Removed console.log in ${path.relative(PROJECT_ROOT, warning.file)}:${warning.line}`, 'warning');
      }
    } catch (error) {
      log(`❌ Failed to fix console.log: ${error.message}`, 'error');
    }
  });

  return fixedCount;
}

function main() {
  log('\n🚀 ESLint Technical Debt Auto-Fixer v2.0\n', 'info');
  log('📊 Analyzing ESLint warnings...\n', 'info');

  const results = getLintErrors();
  
  if (!results || results.length === 0) {
    log('✅ No lint errors found!', 'success');
    return;
  }

  const totalWarnings = results.reduce((sum, file) => sum + (file.messages?.length || 0), 0);
  log(`Found ${totalWarnings} total warnings in ${results.length} files\n`, 'info');

  const categories = categorizeWarnings(results);

  log('📋 Warning Categories:', 'info');
  log(`  • Unused Imports: ${categories.unusedImports.length}`, 'info');
  log(`  • Unused Params: ${categories.unusedParams.length}`, 'info');
  log(`  • Unused Vars: ${categories.unusedVars.length}`, 'info');
  log(`  • Console Logs: ${categories.consoleLogs.length}`, 'info');
  log(`  • Any Types: ${categories.anyTypes.length}\n`, 'info');

  let totalFixed = 0;

  // Phase 1: Fix unused imports
  if (categories.unusedImports.length > 0) {
    log('\n🔧 Phase 1: Fixing Unused Imports...', 'info');
    const fixed = fixUnusedImports(categories.unusedImports);
    totalFixed += fixed;
    log(`  Fixed: ${fixed} imports`, 'success');
  }

  // Phase 2: Fix unused params
  if (categories.unusedParams.length > 0) {
    log('\n🔧 Phase 2: Fixing Unused Parameters...', 'info');
    const fixed = fixUnusedParams(categories.unusedParams);
    totalFixed += fixed;
    log(`  Fixed: ${fixed} parameters`, 'success');
  }

  // Phase 3: Remove console.logs
  if (categories.consoleLogs.length > 0) {
    log('\n🗑️ Phase 3: Removing Console Logs...', 'info');
    const fixed = fixConsoleLogs(categories.consoleLogs);
    totalFixed += fixed;
    log(`  Removed: ${fixed} console statements`, 'success');
  }

  log(`\n✨ Complete! Total fixed: ${totalFixed} warnings`, 'success');
  log(`\n📝 Remaining tasks:`, 'info');
  log(`  • ${categories.unusedVars.length} unused vars (manual review needed)`, 'warning');
  log(`  • ${categories.anyTypes.length} any types (need type definitions)`, 'warning');
  log('\n💡 Run "pnpm lint" to verify fixes\n', 'info');
}

if (require.main === module) {
  main();
}

module.exports = { getLintErrors, categorizeWarnings };
