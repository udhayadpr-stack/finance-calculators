import { create, all, MathJsStatic } from 'mathjs';

// Create a mathjs instance
const math = create(all, {
  number: 'number', // Use simple numbers for MVP, maybe BigNumber later if needed
  precision: 14,
});

export interface MathResult {
  value: any;
  text: string;
  error?: string;
  isUnit?: boolean;
}

export class OrbitEngine {
  private scope: any;

  constructor(initialScope: any = {}) {
    this.scope = { ...initialScope };
  }

  public evaluate(expression: string): MathResult {
    try {
      // Basic sanitization or pre-processing can go here
      const trimmed = expression.trim();
      if (!trimmed) return { value: null, text: '' };

      const result = math.evaluate(trimmed, this.scope);

      let textResult = '';
      let isUnit = false;

      if (result && typeof result === 'object' && result.isUnit) {
        textResult = result.format({ precision: 4 }); // Nice unit formatting
        isUnit = true;
      } else if (typeof result === 'function') {
        textResult = 'Function defined';
      } else if (result === undefined) {
        textResult = '';
      } else {
        textResult = math.format(result, { precision: 14 });
      }

      return {
        value: result,
        text: textResult,
        isUnit,
      };
    } catch (err: any) {
      return {
        value: null,
        text: '',
        error: err.message,
      };
    }
  }

  public getScope(): any {
    return this.scope;
  }

  public clearScope() {
    this.scope = {};
  }
}

export const defaultEngine = new OrbitEngine();
