#!/usr/bin/env node

/**
 * Unused Icons Cleaner v4.0
 * 专门清理未使用的 lucide-react 图标导入
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();

function log(msg, type = 'info') {
  const c = { info: '\x1b[36m', success: '\x1b[32m', warning: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m' };
  console.log(`${c[type]}${msg}${c.reset}`);
}

function getUnusedImportWarnings() {
  try {
    const output = execSync(
      `npx eslint "${PROJECT_ROOT}/src" --format json --no-error-on-unmatched-pattern 2>/dev/null`,
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

// 检查变量是否在文件的其余部分被使用（排除导入行）
function isVariableUsedInFile(content, varName, importLineNum) {
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (i === importLineNum - 1) continue; // 跳过导入行本身

    const line = lines[i];

    // 检查是否在JSX中使用 <VarName 或 <VarName
    if (new RegExp(`<${varName}[\\s/>]`).test(line)) {
      return true;
    }

    // 检查是否在表达式中使用
    // 排除注释行
    if (!line.trim().startsWith('//') && !line.trim().startsWith('*')) {
      if (new RegExp(`[^a-zA-Z_]${varName}[^a-zA-Z_]`).test(line)) {
        return true;
      }

      // 检查行首使用
      if (new RegExp(`^\\s*${varName}[^a-zA-Z_]`).test(line)) {
        return true;
      }
    }
  }

  return false;
}

function cleanLucideImports(filePath, warnings) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let removedCount = 0;

  const lucideWarnings = warnings.filter((w) => {
    const varName = extractVarName(w.message);
    return (varName && content.includes("from 'lucide-react'")) || content.includes('"lucide-react"');
  });

  if (lucideWarnings.length === 0) return { modified: false, count: 0 };

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line.includes('from ')) continue;
    if (!line.includes("'lucide-react'") && !line.includes('"lucide-react"')) continue;

    const importMatch = line.match(/import\s*\{([^}]*)\}\s*from\s*['"]lucide-react['"]/);
    if (!importMatch) continue;

    let imports = importMatch[1]
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const originalImports = [...imports];

    imports = imports.filter((imp) => {
      const warning = lucideWarnings.find((w) => extractVarName(w.message) === imp && w.line === i + 1);
      if (!warning) return true;

      const varName = extractVarName(warning.message);
      if (!varName) return true;

      if (!isVariableUsedInFile(content, varName, i + 1)) {
        log(`  🗑️ Removing unused icon: ${varName}`, 'warning');
        return false;
      }
      return true;
    });

    if (imports.length !== originalImports.length) {
      if (imports.length === 0) {
        lines[i] = ''; // 删除整行
      } else {
        lines[i] = line.replace(/\{[^}]*\}/, `{ ${imports.join(', ')} }`);
      }
      modified = true;
      removedCount += originalImports.length - imports.length;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  }

  return { modified, count: removedCount };
}

function cleanOtherImports(filePath, warnings) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let removedCount = 0;

  const lines = content.split('\n');
  const fileWarnings = warnings.filter((w) => w.file === filePath);

  for (const warning of fileWarnings) {
    const varName = extractVarName(warning.message);
    if (!varName || varName.startsWith('_')) continue;

    const lineIdx = warning.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) continue;

    const line = lines[lineIdx];

    if (!line.includes(varName)) continue;
    if (!line.trim().startsWith('import')) continue;

    const importMatch = line.match(/import\s*\{([^}]*)\}\s*from/);
    if (importMatch) {
      let imports = importMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== varName && !s.startsWith(`${varName} `) && !s.startsWith(`${varName},`));

      if (imports.length === 0) {
        lines[lineIdx] = '';
      } else {
        lines[lineIdx] = line.replace(/\{[^}]*\}/, `{ ${imports.join(', ')} }`);
      }

      modified = true;
      removedCount++;
      log(`  🗑️ Removed unused import: ${varName}`, 'warning');
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  }

  return { modified, count: removedCount };
}

function main() {
  log('\n🎨 Unused Icons & Imports Cleaner v4.0\n', 'info');

  const results = getUnusedImportWarnings();

  if (!results?.length) {
    log('✅ No lint errors found!', 'success');
    return;
  }

  const allWarnings = results.flatMap((f) =>
    (f.messages || [])
      .filter((m) => m.ruleId === 'no-unused-vars' || m.ruleId === '@typescript-eslint/no-unused-vars')
      .map((m) => ({ file: f.filePath, ...m }))
  );

  const unusedVarsWarnings = allWarnings.filter((w) => {
    const msg = w.message.toLowerCase();
    return msg.includes('defined but never used') || msg.includes('assigned a value but never used');
  });

  log(`Found ${unusedVarsWarnings.length} unused vars warnings`, 'info');

  // 按文件分组
  const byFile = {};
  unusedVarsWarnings.forEach((w) => {
    byFile[w.file] = byFile[w.file] || [];
    byFile[w.file].push(w);
  });

  let totalRemoved = 0;
  let filesModified = 0;

  Object.entries(byFile).forEach(([filePath, warnings]) => {
    const relPath = path.relative(PROJECT_ROOT, filePath);

    // Phase 1: Clean lucide-react imports
    const result1 = cleanLucideImports(filePath, warnings);

    // Phase 2: Clean other imports
    const result2 = cleanOtherImports(filePath, warnings);

    if (result1.modified || result2.modified) {
      totalRemoved += result1.count + result2.count;
      filesModified++;
      log(`\n✅ ${relPath}: removed ${result1.count + result2.count} unused imports`, 'success');
    }
  });

  log(`\n✨ Complete!`, 'info');
  log(`  Files modified: ${filesModified}`, 'info');
  log(`  Total imports removed: ${totalRemoved}`, 'success');
  log(`\n💡 Run "pnpm test && pnpm lint" to verify\n`, 'info');
}

main();
