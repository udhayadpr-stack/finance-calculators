import React, { useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CellData } from '../types';

interface CellProps {
    data: CellData;
    onChange: (text: string) => void;
    onFocus?: () => void;
    onDelete?: () => void;
    isActive?: boolean;
}

export const Cell: React.FC<CellProps> = ({ data, onChange, onFocus, onDelete, isActive }) => {
    const inputRef = useRef<TextInput>(null);

    // Auto-focus if active (when added)
    // useEffect(() => {
    //   if (isActive && inputRef.current) {
    //     inputRef.current.focus();
    //   }
    // }, [isActive]);

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={data.rawInput}
                    onChangeText={onChange}
                    onFocus={onFocus}
                    multiline
                    placeholder="Type math..."
                    placeholderTextColor="#666"
                />
            </View>
            <View style={styles.resultContainer}>
                {data.error ? (
                    <Text style={styles.errorText}>{data.error}</Text>
                ) : (
                    <Text style={styles.resultText}>{data.output}</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 16, // Screen padding
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'flex-start',
        minHeight: 60,
    },
    inputContainer: {
        flex: 1,
        marginRight: 10,
    },
    input: {
        fontSize: 18,
        fontFamily: 'System',
        color: '#000',
        paddingTop: 0, // Align text to top
    },
    resultContainer: {
        flex: 0.8,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingTop: 2,
    },
    resultText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#007AFF',
    },
    errorText: {
        fontSize: 14,
        color: 'red',
    },
});
