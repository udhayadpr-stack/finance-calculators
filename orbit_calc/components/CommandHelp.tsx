import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

interface CommandHelpProps {
    visible: boolean;
    onClose: () => void;
}

const COMMANDS = [
    { name: 'sin(x)', desc: 'Sine of x (radians)' },
    { name: 'cos(x)', desc: 'Cosine of x' },
    { name: 'tan(x)', desc: 'Tangent of x' },
    { name: 'log(x)', desc: 'Natural logarithm' },
    { name: 'log10(x)', desc: 'Base-10 logarithm' },
    { name: 'sqrt(x)', desc: 'Square root' },
    { name: 'exp(x)', desc: 'Exponential e^x' },
    { name: 'det(A)', desc: 'Determinant of matrix' },
    { name: 'inv(A)', desc: 'Inverse of matrix' },
    { name: 'cross(A, B)', desc: 'Cross product' },
    { name: 'dot(A, B)', desc: 'Dot product' },
    { name: 'unit("5 cm")', desc: 'Unit parsing' },
    { name: 'f(x) = x^2', desc: 'Function definition' },
    { name: 'a = 10', desc: 'Variable assignment' },
];

export const CommandHelp: React.FC<CommandHelpProps> = ({ visible, onClose }) => {
    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Available Commands</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.list}>
                    {COMMANDS.map((cmd, idx) => (
                        <View key={idx} style={styles.item}>
                            <Text style={styles.cmd}>{cmd.name}</Text>
                            <Text style={styles.desc}>{cmd.desc}</Text>
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    closeText: {
        color: '#007AFF',
        fontSize: 16,
    },
    list: {
        padding: 16,
    },
    item: {
        marginBottom: 16,
    },
    cmd: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    desc: {
        fontSize: 14,
        color: '#666',
    },
});
