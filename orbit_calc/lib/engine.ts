import { create, all } from 'mathjs';

// Create a mathjs instance
const math = create(all, {
  number: 'number', // Use simple numbers for MVP, maybe BigNumber later if needed
  precision: 14,
});

export interface MathResult {
  value: unknown;
  text: string;
  error?: string;
  isUnit?: boolean;
}

export class OrbitEngine {
  private scope: Map<string, unknown>;

  constructor(initialScope: Record<string, unknown> = {}) {
    this.scope = new Map(Object.entries(initialScope));
  }

  public evaluate(expression: string): MathResult {
    let snapshot: Map<string, unknown> | undefined;
    try {
      // Basic sanitization or pre-processing can go here
      const trimmed = expression.trim();
      if (!trimmed) return { value: null, text: '' };

      if (trimmed.length > 2000) throw new Error('Keep each expression under 2,000 characters.');
      const node = math.parse(trimmed);
      const blocked = new Set(['import', 'createUnit', 'evaluate', 'parse', 'compile', 'reviver']);
      node.traverse(child => {
        if (child.type === 'SymbolNode' && blocked.has((child as unknown as { name: string }).name)) {
          throw new Error('This function is unavailable in the workspace.');
        }
      });
      // A failed expression must not leak partial assignments into later lines.
      snapshot = new Map([...this.scope].map(([key, value]) => [key, math.clone(value)]));
      // Preserve Map identity: user functions close over this scope and must see later edits.
      const result = node.evaluate(this.scope);

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
    } catch (err: unknown) {
      if (snapshot) {
        this.scope.clear();
        for (const [key, value] of snapshot) this.scope.set(key, value);
      }
      return {
        value: null,
        text: '',
        error: err instanceof Error ? err.message : 'Unable to evaluate expression.',
      };
    }
  }

  public getScope(): Record<string, unknown> {
    return Object.fromEntries(this.scope);
  }

  public clearScope() {
    this.scope.clear();
  }
}

export const defaultEngine = new OrbitEngine();
