#!/usr/bin/env node

/**
 * Advanced Unused Vars Fixer v3.0
 * 专门处理未使用的变量和导入
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();

function log(msg, type = 'info') {
  const c = { info: '\x1b[36m', success: '\x1b[32m', warning: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m' };
  console.log(`${c[type]}${msg}${c.reset}`);
}

function getUnusedVarsWarnings() {
  try {
    const output = execSync(
      `npx eslint "${PROJECT_ROOT}/src" --format json --rule '{"no-unused-vars":"error","@typescript-eslint/no-unused-vars":"error"}' 2>/dev/null`,
      { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );
    return JSON.parse(output);
  } catch (e) {
    return e.stdout ? JSON.parse(e.stdout) : [];
  }
}

function extractVarName(message) {
  const m = message.match(/'([^']+)'/);
  return m ? m[1] : null;
}

function isImportStatement(line, varName) {
  return line.trim().startsWith('import') && line.includes(varName);
}

function removeFromImport(line, varName) {
  // 处理: import { a, b, c } from 'mod'
  const importMatch = line.match(/import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/);
  if (importMatch) {
    let imports = importMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(imp => imp !== varName && !imp.startsWith(`${varName} `) && !imp.startsWith(`${varName},`));
    
    if (imports.length === 0) {
      return null; // 删除整行
    }
    
    // 处理类型导入: import type { ... }
    const isTypeImport = line.includes('import type');
    return line.replace(
      /import(?:\s+type)?\s*\{[^}]*\}\s*from/,
      `${isTypeImport ? 'import type' : 'import'} { ${imports.join(', ')} } from`
    );
  }

  // 处理: import DefaultExport from 'mod'
  if (line.match(new RegExp(`^import\\s+${varName}\\s+from`))) {
    return null;
  }

  // 处理: import * as name from 'mod'
  if (line.includes(`* as ${varName}`)) {
    return null;
  }

  return line;
}

function fixFile(filePath, warnings) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let fixesCount = 0;

  // 按行号降序处理，避免行号偏移
  const sortedWarnings = [...warnings].sort((a, b) => b.line - a.line);

  sortedWarnings.forEach(warning => {
    const varName = extractVarName(warning.message);
    if (!varName || varName.startsWith('_')) return; // 跳过已有_前缀的

    const lines = content.split('\n');
    const lineIdx = warning.line - 1;
    
    if (lineIdx < 0 || lineIdx >= lines.length) return;

    const line = lines[lineIdx];

    if (isImportStatement(line, varName)) {
      const newLine = removeFromImport(line, varName);
      if (newLine === null) {
        lines[lineIdx] = ''; // 删除整行
      } else if (newLine !== line) {
        lines[lineIdx] = newLine;
      }
      content = lines.join('\n');
      modified = true;
      fixesCount++;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  return fixesCount;
}

function main() {
  log('\n🔧 Advanced Unused Vars Fixer v3.0\n', 'info');

  const results = getUnusedVarsWarnings();
  
  if (!results?.length) {
    log('✅ No unused vars found!', 'success');
    return;
  }

  const allWarnings = results.flatMap(f => 
    (f.messages || [])
      .filter(m => m.ruleId === 'no-unused-vars' || m.ruleId === '@typescript-eslint/no-unused-vars')
      .map(m => ({ file: f.filePath, ...m }))
  );

  log(`Found ${allWarnings.length} unused vars warnings`, 'info');

  // 按文件分组
  const byFile = {};
  allWarnings.forEach(w => {
    byFile[w.file] = byFile[w.file] || [];
    byFile[w.file].push(w);
  });

  let totalFixed = 0;
  Object.entries(byFile).forEach(([file, warnings]) => {
    const fixed = fixFile(file, warnings);
    if (fixed > 0) {
      totalFixed += fixed;
      log(`  ✅ ${path.relative(PROJECT_ROOT, file)}: fixed ${fixed}`, 'success');
    }
  });

  log(`\n✨ Total fixed: ${totalFixed} unused imports/vars`, 'success');
}

main();
