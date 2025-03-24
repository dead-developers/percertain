import type { languages, editor } from 'monaco-editor'

export const PercertainLanguage: languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.percertain',

  keywords: [
    '@app', '@description', '@data', '@variables', '@ui', '@actions', '@mods'
  ],

  // Mod prefixes and suffixes
  modPrefixes: [
    'data', 'text', 'visual', 'create', 'play', 'code'
  ],

  modSuffixes: [
    'think', 'visual', 'create', 'code'
  ],

  // Brackets and delimiters
  brackets: [
    { open: '{', close: '}', token: 'delimiter.curly' },
    { open: '[', close: ']', token: 'delimiter.square' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' },
  ],

  // Token rules
  tokenizer: {
    root: [
      // Mods (e.g., data-think, visual-think-code)
      [/[a-zA-Z]+-[a-zA-Z]+(-[a-zA-Z]+)?/, {
        cases: {
          '$1-$2-$3': 'mod',
          '$1-$2': 'mod',
          '@default': 'identifier'
        }
      }],

      // Keywords
      [/@[a-zA-Z]+/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'identifier'
        }
      }],

      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single'],

      // Comments
      [/\/\/.*$/, 'comment'],
      [/\/\*/, 'comment', '@comment'],

      // Variables
      [/\$[a-zA-Z][a-zA-Z0-9_]*/, 'variable'],

      // Delimiters
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/[;,.]/, 'delimiter'],

      // Numbers
      [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // Identifiers
      [/[a-zA-Z_]\w*/, {
        cases: {
          '@modPrefixes': 'mod.prefix',
          '@modSuffixes': 'mod.suffix',
          '@default': 'identifier'
        }
      }],
    ],

    comment: [
      [/[^/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      ["\\*/", 'comment', '@pop'],
      [/[/*]/, 'comment']
    ],

    string_double: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, 'string', '@pop']
    ],

    string_single: [
      [/[^\\']+/, 'string'],
      [/\\./, 'string.escape'],
      [/'/, 'string', '@pop']
    ],
  },
}

export const PercertainTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'mod', foreground: '#c678dd' },
    { token: 'mod.prefix', foreground: '#61afef' },
    { token: 'mod.suffix', foreground: '#98c379' },
    { token: 'keyword', foreground: '#e06c75' },
    { token: 'variable', foreground: '#d19a66' },
    { token: 'string', foreground: '#98c379' },
    { token: 'comment', foreground: '#5c6370', fontStyle: 'italic' },
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#abb2bf',
    'editor.lineHighlightBackground': '#2c313c',
    'editorCursor.foreground': '#528bff',
    'editor.selectionBackground': '#3e4451',
  }
}