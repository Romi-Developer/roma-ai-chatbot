'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  value: string;
}

// Lightweight syntax highlighting using regex
const KEYWORDS: Record<string, string[]> = {
  javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'typeof', 'instanceof', 'in', 'of', 'extends', 'super', 'static', 'get', 'set', 'yield', 'break', 'continue', 'switch', 'case', 'do', 'null', 'undefined', 'true', 'false'],
  typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'typeof', 'instanceof', 'in', 'of', 'extends', 'super', 'static', 'get', 'set', 'yield', 'break', 'continue', 'switch', 'case', 'do', 'null', 'undefined', 'true', 'false', 'interface', 'type', 'enum', 'namespace', 'declare', 'readonly', 'public', 'private', 'protected', 'abstract', 'implements', 'as', 'is', 'keyof', 'infer', 'never', 'unknown', 'any', 'void', 'string', 'number', 'boolean', 'object', 'symbol', 'bigint'],
  python: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'async', 'await', 'yield', 'lambda', 'pass', 'break', 'continue', 'raise', 'global', 'nonlocal', 'None', 'True', 'False', 'and', 'or', 'not', 'in', 'is', 'del', 'assert', 'self', 'cls'],
  java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'super', 'static', 'final', 'void', 'int', 'long', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'String', 'import', 'package', 'try', 'catch', 'finally', 'throw', 'throws', 'instanceof', 'null', 'true', 'false', 'abstract', 'synchronized', 'volatile', 'transient', 'native', 'enum'],
  go: ['package', 'import', 'func', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 'go', 'defer', 'select', 'nil', 'true', 'false'],
  rust: ['fn', 'let', 'mut', 'const', 'static', 'return', 'if', 'else', 'for', 'while', 'loop', 'match', 'struct', 'enum', 'trait', 'impl', 'pub', 'use', 'mod', 'crate', 'self', 'super', 'as', 'in', 'ref', 'move', 'where', 'async', 'await', 'dyn', 'unsafe', 'true', 'false', 'None', 'Some', 'Ok', 'Err'],
  sql: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'INDEX', 'VIEW', 'INTO', 'VALUES', 'SET', 'AND', 'OR', 'NOT', 'NULL', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'AS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'UNION', 'ALL', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DEFAULT', 'CONSTRAINT', 'UNIQUE', 'CHECK', 'CASCADE'],
  bash: ['if', 'then', 'else', 'elif', 'fi', 'for', 'in', 'do', 'done', 'while', 'until', 'case', 'esac', 'function', 'return', 'exit', 'echo', 'export', 'local', 'readonly', 'declare', 'source', 'alias', 'trap', 'set', 'unset', 'shift', 'true', 'false'],
  html: [],
  css: [],
  json: [],
  jsx: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'typeof', 'extends', 'super', 'static', 'true', 'false', 'null', 'undefined'],
  tsx: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'typeof', 'extends', 'super', 'static', 'interface', 'type', 'enum', 'readonly', 'public', 'private', 'protected', 'as', 'true', 'false', 'null', 'undefined'],
};

function highlightCode(code: string, language: string): string {
  const lang = language.toLowerCase();
  const keywords = KEYWORDS[lang] || KEYWORDS[language] || [];

  let html = code
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>');

  // Comments
  if (lang === 'python' || lang === 'bash' || lang === 'sh') {
    html = html.replace(/(#[^\n]*)/g, '<span class="tok-comment">$1</span>');
  } else if (lang === 'sql') {
    html = html.replace(/(--[^\n]*)/g, '<span class="tok-comment">$1</span>');
  } else {
    html = html.replace(/(\/\/[^\n]*)/g, '<span class="tok-comment">$1</span>');
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-comment">$1</span>');
  }

  // Strings
  html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="tok-string">$1</span>');
  html = html.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="tok-string">$1</span>');
  html = html.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span class="tok-string">$1</span>');

  // Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-number">$1</span>');

  // Keywords
  if (keywords.length > 0) {
    const kwPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    html = html.replace(kwPattern, '<span class="tok-keyword">$1</span>');
  }

  // Function calls
  html = html.replace(/\b([a-zA-Z_]\w*)(\s*\()/g, '<span class="tok-function">$1</span>$2');

  return html;
}

export default function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lang = language || 'plaintext';
  const highlighted = highlightCode(value, lang);

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border bg-bg-tertiary">
      <div className="flex items-center justify-between border-b border-border bg-bg-tertiary px-4 py-2">
        <span className="text-xs font-medium text-text-secondary">
          {lang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code
          className="font-mono"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
