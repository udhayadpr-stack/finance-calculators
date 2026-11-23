import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Text, SafeAreaView, Share, Alert } from 'react-native';
import { useWorkspaceStore } from '../../lib/store';
import { Cell } from '../../components/Cell';
import { CommandHelp } from '../../components/CommandHelp';
import { CellData } from '../../types';

export default function WorkspaceScreen() {
  const { cells, addCell, updateCellInput, deleteCell, evaluateAll, hasHydrated, storageError } = useWorkspaceStore();
  const flatListRef = useRef<FlatList>(null);
  useEffect(() => { void useWorkspaceStore.persist.rehydrate(); }, []);
  const [helpVisible, setHelpVisible] = useState(false);

  const handleShare = async () => {
    try {
      const content = cells
        .map(c => {
          if (!c.rawInput.trim()) return '';
          return `${c.rawInput} = ${c.error ? `Error: ${c.error}` : c.output ?? '?'}`;
        })
        .filter(line => line)
        .join('\n');

      if (!content) { Alert.alert('Nothing to share', 'Add a calculation first.'); return; }
      await Share.share({
        message: content,
        title: 'OrbitCalc Workspace',
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const renderItem = ({ item }: { item: CellData }) => (
    <Cell
      data={item}
      onChange={(text) => updateCellInput(item.id, text)}
      onDelete={() => deleteCell(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>OrbitCalc</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setHelpVisible(true)} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={evaluateAll} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>Run</Text>
          </TouchableOpacity>
        </View>
      </View>

      {storageError && <Text accessibilityRole="alert" style={{padding: 16, color: '#b91c1c'}}>{storageError}</Text>}
      {!hasHydrated && <Text style={{padding: 16}}>Loading saved workspace…</Text>}
      <FlatList
        ref={flatListRef}
        data={hasHydrated ? cells : []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={styles.footer}
      >
        <TouchableOpacity
          style={styles.addButton}
          disabled={!hasHydrated}
          accessibilityRole="button"
          accessibilityLabel="Add new line"
          onPress={() => { addCell(); requestAnimationFrame(() => flatListRef.current?.scrollToEnd({animated: true})); }}
        >
          <Text style={styles.addButtonText}>+ New Line</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <CommandHelp visible={helpVisible} onClose={() => setHelpVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 10,
    padding: 8,
  },
  iconButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
