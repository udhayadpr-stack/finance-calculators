import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CellData, Workspace } from '../types';
import { OrbitEngine } from './engine';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

interface WorkspaceState {
    cells: CellData[];
    engine: OrbitEngine;
    addCell: (afterId?: string) => void;
    updateCellInput: (id: string, input: string) => void;
    deleteCell: (id: string) => void;
    evaluateAll: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            cells: [
                { id: uuidv4(), rawInput: '' },
            ],
            engine: new OrbitEngine(),

            addCell: (afterId) => {
                set((state) => {
                    const newCell: CellData = { id: uuidv4(), rawInput: '' };
                    const index = state.cells.findIndex(c => c.id === afterId);

                    let newCells = [...state.cells];
                    if (index === -1) {
                        newCells.push(newCell);
                    } else {
                        newCells.splice(index + 1, 0, newCell);
                    }
                    return { cells: newCells };
                });
            },

            updateCellInput: (id, input) => {
                set((state) => ({
                    cells: state.cells.map(c => c.id === id ? { ...c, rawInput: input } : c)
                }));
                get().evaluateAll();
            },

            deleteCell: (id) => {
                set((state) => ({
                    cells: state.cells.filter(c => c.id !== id)
                }));
                get().evaluateAll();
            },

            evaluateAll: () => {
                const { cells, engine } = get();
                engine.clearScope();

                const newCells = cells.map(cell => {
                    if (!cell.rawInput.trim()) {
                        return { ...cell, output: undefined, error: undefined };
                    }
                    const result = engine.evaluate(cell.rawInput);
                    return {
                        ...cell,
                        output: result.error ? undefined : result.text,
                        error: result.error
                    };
                });

                set({ cells: newCells });
            }
        }),
        {
            name: 'orbit-workspace',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ cells: state.cells }), // Do not persist engine
            onRehydrateStorage: () => (state) => {
                // Re-run evaluation to populate engine scope after rehydration
                if (state) {
                    state.evaluateAll();
                }
            }
        }
    )
);
