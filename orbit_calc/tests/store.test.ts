import { beforeEach, describe, expect, it, vi } from 'vitest';
const {memory} = vi.hoisted(() => ({memory: new Map<string, string>()}));
vi.mock('@react-native-async-storage/async-storage', () => ({default: {
    getItem: vi.fn(async (key: string) => memory.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {memory.set(key, value);}),
    removeItem: vi.fn(async (key: string) => {memory.delete(key);}),
}}));
vi.mock('expo-crypto', () => ({randomUUID: () => crypto.randomUUID()}));
import { useWorkspaceStore } from '../lib/store';
import { OrbitEngine } from '../lib/engine';
import AsyncStorage from '@react-native-async-storage/async-storage';

beforeEach(() => {
    vi.clearAllMocks();
    memory.clear();
    useWorkspaceStore.setState({cells: [{id: 'first', rawInput: ''}], engine: new OrbitEngine(), hasHydrated: false, storageError: undefined});
});
describe('Workspace persistence and editing', () => {
    it('reevaluates downstream cells when a variable changes or is deleted', () => {
        const store = useWorkspaceStore;
        store.getState().updateCellInput('first', 'a = 2');
        store.getState().addCell('first');
        const second = store.getState().cells[1].id;
        store.getState().updateCellInput(second, 'a * 3');
        expect(store.getState().cells[1].output).toBe('6');
        store.getState().updateCellInput('first', 'a = 4');
        expect(store.getState().cells[1].output).toBe('12');
        store.getState().deleteCell('first');
        expect(store.getState().cells[0].error).toBeTruthy();
        store.getState().deleteCell(second);
        expect(store.getState().cells).toHaveLength(1);
        expect(store.getState().cells[0].rawInput).toBe('');
    });
    it('sanitizes saved lines and rebuilds derived outputs after hydration', async () => {
        memory.set('orbit-workspace', JSON.stringify({state:{cells:[{id:'a', rawInput:'x = 7', output:'stale'}, {id:'b',rawInput:'x+2'}, {id:'b',rawInput:'duplicate'}, {id:4,rawInput:2}]},version:0}));
        await useWorkspaceStore.persist.rehydrate();
        expect(useWorkspaceStore.getState().hasHydrated).toBe(true);
        expect(useWorkspaceStore.getState().cells.map(c => c.output)).toEqual(['7', '9']);
        expect(JSON.parse(memory.get('orbit-workspace')!).state.cells[0]).toEqual({id:'a', rawInput:'x = 7'});
    });
    it('shows save failures without losing editable session state', async () => {
        vi.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Storage full'));
        useWorkspaceStore.getState().updateCellInput('first', '2+2');
        await vi.waitFor(() => expect(useWorkspaceStore.getState().storageError).toContain('could not be saved'));
        expect(useWorkspaceStore.getState().cells[0].output).toBe('4');
    });
    it('recovers a usable session from corrupt saved JSON', async () => {
        memory.set('orbit-workspace', 'broken');
        await useWorkspaceStore.persist.rehydrate();
        expect(useWorkspaceStore.getState().hasHydrated).toBe(true);
        expect(useWorkspaceStore.getState().storageError).toBeTruthy();
        expect(useWorkspaceStore.getState().cells).toHaveLength(1);
    });
});
