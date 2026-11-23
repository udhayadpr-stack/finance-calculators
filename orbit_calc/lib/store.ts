import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CellData } from '../types';
import { OrbitEngine } from './engine';
import { randomUUID } from 'expo-crypto';

interface WorkspaceState {
    cells: CellData[];
    engine: OrbitEngine;
    hasHydrated: boolean;
    storageError?: string;
    finishHydration: (error?: string) => void;
    addCell: (afterId?: string) => void;
    updateCellInput: (id: string, input: string) => void;
    deleteCell: (id: string) => void;
    evaluateAll: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            cells: [
                { id: 'initial-cell', rawInput: '' },
            ],
            engine: new OrbitEngine(),
            hasHydrated: false,
            finishHydration: (storageError) => set({ hasHydrated: true, storageError }),

            addCell: (afterId) => {
                set((state) => {
                    const newCell: CellData = { id: randomUUID(), rawInput: '' };
                    const index = state.cells.findIndex(c => c.id === afterId);

                    const newCells = [...state.cells];
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
                set((state) => {
                    const remaining = state.cells.filter(c => c.id !== id);
                    return { cells: remaining.length ? remaining : [{ id: randomUUID(), rawInput: '' }] };
                });
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
            storage: createJSONStorage(() => ({
                getItem: (name) => AsyncStorage.getItem(name),
                removeItem: (name) => AsyncStorage.removeItem(name),
                setItem: async (name, value) => {
                    try { await AsyncStorage.setItem(name, value); }
                    catch {
                        const message = 'Changes could not be saved on this device. Keep this session open or share your worksheet.';
                        if (useWorkspaceStore.getState().storageError !== message) {
                            useWorkspaceStore.setState({ storageError: message });
                        }
                    }
                },
            })),
            skipHydration: true,
            partialize: (state) => ({ cells: state.cells.map(({id, rawInput}) => ({id, rawInput})) }),
            merge: (persisted, current) => {
                const saved = persisted as { cells?: unknown } | undefined;
                if (!Array.isArray(saved?.cells)) return current;
                const seen = new Set<string>();
                const cells = saved.cells.filter((cell): cell is CellData => {
                    if (!cell || typeof cell.id !== 'string' || typeof cell.rawInput !== 'string' || seen.has(cell.id)) return false;
                    seen.add(cell.id);
                    return true;
                }).map(({id, rawInput}) => ({id, rawInput}));
                return { ...current, cells: cells.length ? cells : current.cells };
            },
            onRehydrateStorage: (initial) => (state, error) => {
                if (state) state.evaluateAll();
                (state ?? initial).finishHydration(error ? 'Saved workspace could not be loaded. This session may not be saved.' : undefined);
            }
        }
    )
);
