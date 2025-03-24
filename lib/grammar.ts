// Percertain DSL Grammar Definition

import { Grammar, GrammarProperty } from './types';

export const grammar: Grammar = {
  // Top-level structure
  app: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          '*': {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                enum: ['csv', 'json', 'folder', 'image', 'api']
              },
              path: { type: 'string' },
              url: { type: 'string' }
            }
          }
        }
      },
      variables: {
        type: 'object',
        properties: {
          '*': {
            type: 'union',
            variants: ['string', 'number', 'boolean', 'array', 'object']
          }
        }
      },
      ui: {
        type: 'object',
        properties: {
          layout: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                section: { type: 'string' }
              }
            }
          },
          components: {
            type: 'object',
            properties: {
              '*': {
                type: 'array',
                items: { type: 'string', pattern: '^component$' }
              }
            }
          }
        }
      },
      actions: {
        type: 'object',
        properties: {
          '*': { type: 'string' }
        }
      },
      mods: {
        type: 'array',
        items: {
          type: 'string',
          pattern: '^[a-z]+-[a-z]+(-[a-z]+)?$'
        }
      }
    }
  },

  // Component definitions
  component: {
    type: 'union',
    variants: [
      'headingComponent',
      'textComponent',
      'buttonComponent',
      'inputComponent',
      'selectComponent',
      'uploadComponent',
      'cardComponent',
      'chartComponent',
      'tableComponent',
      'whenComponent'
    ]
  },

  // Basic components
  headingComponent: {
    type: 'object',
    properties: {
      heading: {
        type: 'object',
        properties: {
          text: { type: 'string' }
        }
      }
    }
  },

  textComponent: {
    type: 'object',
    properties: {
      text: {
        type: 'object',
        properties: {
          content: { type: 'string' }
        }
      }
    }
  },

  buttonComponent: {
    type: 'object',
    properties: {
      button: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          action: { type: 'string' }
        }
      }
    }
  },

  inputComponent: {
    type: 'object',
    properties: {
      input: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          type: {
            type: 'string',
            enum: ['text', 'number', 'email', 'password']
          },
          bind: { type: 'string' },
          placeholder: { type: 'string' }
        }
      }
    }
  },

  selectComponent: {
    type: 'object',
    properties: {
      select: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          options: {
            type: 'array',
            items: { type: 'string' }
          },
          bind: { type: 'string' },
          multiple: { type: 'boolean' }
        }
      }
    }
  },

  uploadComponent: {
    type: 'object',
    properties: {
      upload: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          bind: { type: 'string' },
          accept: { type: 'string' }
        }
      }
    }
  },

  cardComponent: {
    type: 'object',
    properties: {
      card: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' }
        }
      }
    }
  },

  chartComponent: {
    type: 'object',
    properties: {
      chart: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['auto', 'line', 'bar', 'pie', 'scatter']
          },
          data: { type: 'string' },
          x: { type: 'string' },
          y: { type: 'string' }
        }
      }
    }
  },

  tableComponent: {
    type: 'object',
    properties: {
      table: {
        type: 'object',
        properties: {
          data: { type: 'string' },
          columns: {
            type: 'array',
            items: { type: 'string' }
          },
          pagination: { type: 'boolean' },
          search: { type: 'boolean' }
        }
      }
    }
  },

  whenComponent: {
    type: 'object',
    properties: {
      when: { type: 'string' },
      show: {
        type: 'array',
        items: { type: 'string', pattern: '^component$' }
      }
    }
  }
};

// Helper types for variable interpolation
export const interpolationPattern = /\{([^}]+)\}/g;

// Helper types for mod combinations
export const validModPrefixes = ['data', 'visual', 'code', 'create', 'play'] as const;
export const validModSuffixes = ['think', 'visual', 'code', 'create'] as const;

// Export types
export type DSLGrammar = typeof grammar;