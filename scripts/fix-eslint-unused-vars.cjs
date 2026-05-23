#!/usr/bin/env node

/**
 * ESLint Unused Vars Auto-Fixer
 * 
 * 批量修复 no-unused-vars 和 @typescript-eslint/no-unused-vars 警告
 * 策略:
 * 1. 删除未使用的导入语句
 * 2. 给未使用的参数添加下划线前缀 (_param)
 * 3. 给未使用的事件参数重命名 (e → _e, event → _event)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getESLintWarnings() {
  try {
    const output = execSync('npx eslint . --format json 2>/dev/null', { encoding: 'utf-8' });
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

function fixUnusedVars() {
  console.log('🔍 正在分析 ESLint warnings...');
  
  const results = getESLintWarnings();
  const unusedVarWarnings = results.flatMap(file => 
    (file.messages || []).filter(msg => 
      msg.ruleId === 'no-unused-vars' || msg.ruleId === '@typescript-eslint/no-unused-vars'
    ).map(msg => ({
      file: file.filePath,
      line: msg.line,
      column: msg.column,
      message: msg.message,
      ruleId: msg.ruleId,
    }))
  );

  console.log(`\n📊 找到 ${unusedVarWarnings.length} 个未使用变量警告`);

  // 按文件分组
  const warningsByFile = {};
  unusedVarWarnings.forEach(warning => {
    if (!warningsByFile[warning.file]) {
      warningsByFile[warning.file] = [];
    }
    warningsByFile[warning.file].push(warning);
  });

  let fixedCount = 0;
  
  Object.entries(warningsByFile).forEach(([filePath, warnings]) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // 按行号排序（从大到小，避免修改后行号变化）
      warnings.sort((a, b) => b.line - a.line);
      
      let modified = false;
      
      warnings.forEach(warning => {
        const lineIndex = warning.line - 1;
        if (lineIndex < 0 || lineIndex >= lines.length) return;

        const line = lines[lineIndex];
        const varName = extractVarName(warning.message);

        if (!varName) return;

        // 检查是否是导入语句
        if (isImportStatement(line, varName)) {
          lines[lineIndex] = removeImport(line, varName);
          modified = true;
          fixedCount++;
        } else if (isFunctionParameter(line, varName)) {
          lines[lineIndex] = renameParameter(line, varName);
          modified = true;
          fixedCount++;
        } else if (isDestructuredParam(line, varName)) {
          lines[lineIndex] = renameDestructuredParam(line, varName);
          modified = true;
          fixedCount++;
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
        console.log(`✅ 已修复: ${path.relative(process.cwd(), filePath)} (${warnings.filter(w => lines[w.line - 1] !== fs.readFileSync(filePath, 'utf-8').split('\n')[w.line - 1]).length} 个)`);
      }
    } catch (error) {
      console.error(`❌ 处理失败: ${filePath}`, error.message);
    }
  });

  console.log(`\n✨ 完成! 共修复 ${fixedCount} 个警告`);
}

function extractVarName(message) {
  const match = message.match(/'([^']+)' is defined but never used/);
  return match ? match[1] : null;
}

function isImportStatement(line, varName) {
  return line.trim().startsWith('import') && line.includes(varName);
}

function removeImport(line, varName) {
  // 处理多变量导入: import { a, b, c } from 'module'
  const importMatch = line.match(/import\s*\{([^}]*)\}\s*from/);
  if (importMatch) {
    const imports = importMatch[1]
      .split(',')
      .map(imp => imp.trim())
      .filter(imp => imp !== varName && !imp.startsWith(`${varName} `));
    
    if (imports.length === 0) {
      return ''; // 删除整行
    }
    
    return line.replace(/\{[^}]*\}/, `{ ${imports.join(', ')} }`);
  }

  // 处理默认导入: import VarName from 'module'
  if (line.includes(`import ${varName}`)) {
    return '';
  }

  return line;
}

function isFunctionParameter(line, varName) {
  // 匹配函数参数: function name(param), (param) =>, etc.
  const patterns = [
    /\(([^)]*)\)\s*=>/,
    /function\s*\w*\s*\(([^)]*)\)/,
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match && match[1].includes(varName)) {
      return true;
    }
  }
  return false;
}

function renameParameter(line, varName) {
  // 重命名参数，添加下划线前缀
  return line.replaceAll(new RegExp(`\\b${varName}\\b`, 'g'), `_${varName}`);
}

function isDestructuredParam(line, varName) {
  return line.includes(`{ ${varName}`) || line.includes(`{${varName}`) || line.includes(`${varName},`) || line.includes(`${varName} }`);
}

function renameDestructuredParam(line, varName) {
  // 重命名解构参数
  return line.replaceAll(new RegExp(`\\b${varName}\\b`, 'g'), `_${varName}`);
}

if (require.main === module) {
  fixUnusedVars();
}

module.exports = { fixUnusedVars };
