import { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { Document, DocumentType, SaveDocumentInput } from '../../types/document.types';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography, ThemeColors } from '../../constants/theme';

interface DocumentFormProps {
  type: DocumentType;
  initialValue?: Document;
  onSubmit: (data: SaveDocumentInput) => Promise<void>;
  onDelete?: () => void;
  loading: boolean;
  deleting?: boolean;
}

const TITLES: Record<DocumentType, string> = {
  INSURANCE: 'Insurance',
  PUC: 'PUC Certificate',
  RC: 'Registration Certificate',
  OTHER: 'Document',
};

export function DocumentForm({ type,
  initialValue,
  onSubmit,
  onDelete,
  loading,
  deleting = false, }: DocumentFormProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [issueDate, setIssueDate] = useState(initialValue?.issueDate?.slice(0, 10) ?? '');
  const [expiryDate, setExpiryDate] = useState(initialValue?.expiryDate?.slice(0, 10) ?? '');
  // insurance-only
  const [company, setCompany] = useState(initialValue?.company ?? '');
  const [policyNumber, setPolicyNumber] = useState(initialValue?.policyNumber ?? '');
  const [insuredAmount, setInsuredAmount] = useState(initialValue?.insuredAmount?.toString() ?? '');
  // puc / rc / other
  const [certificateNumber, setCertificateNumber] = useState(initialValue?.certificateNumber ?? '');

  // handle form submission
  const handleSubmit = () => {
    onSubmit({
      type,
      title: type === 'OTHER' ? title.trim() : undefined,
      expiryDate: new Date(expiryDate).toISOString(),
      issueDate: issueDate ? new Date(issueDate).toISOString() : undefined,
      ...(type === 'INSURANCE'
        ? { company: company.trim(), policyNumber: policyNumber.trim(), insuredAmount: insuredAmount ? Number(insuredAmount) : undefined }
        : { certificateNumber: certificateNumber.trim() || undefined }),
    });
  };

  // validation: expiryDate is required, title is required for OTHER
  const canSubmit = expiryDate && (type !== 'OTHER' || title.trim());
  const screenTitle = initialValue ? `Edit ${TITLES[type]}` : `Add ${TITLES[type]}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{screenTitle}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {type === 'OTHER' && (
            <TextField label="Title" placeholder="e.g. Warranty Card" value={title} onChangeText={setTitle} />
          )}

          {type === 'INSURANCE' ? (
            <>
              <TextField label="Company" placeholder="e.g. ICICI Lombard" value={company} onChangeText={setCompany} />
              <TextField label="Policy Number" placeholder="e.g. POL123456" value={policyNumber} onChangeText={setPolicyNumber} />
              <TextField label="Insured Amount (₹)" placeholder="e.g. 50000" value={insuredAmount} onChangeText={setInsuredAmount} keyboardType="numeric" />
            </>
          ) : (
            <TextField
              label={type === 'RC' ? 'RC Number' : type === 'PUC' ? 'Certificate Number' : 'Document Number (optional)'}
              placeholder="e.g. RC123456"
              value={certificateNumber}
              onChangeText={setCertificateNumber}
            />
          )}

          <TextField label="Issue Date (optional)" placeholder="YYYY-MM-DD" value={issueDate} onChangeText={setIssueDate} />
          <TextField label="Expiry Date" placeholder="YYYY-MM-DD" value={expiryDate} onChangeText={setExpiryDate} />

          <Button label={loading ? 'Saving...' : 'Save'} onPress={handleSubmit} loading={loading} disabled={!canSubmit} />
          
          {initialValue && onDelete && (
            <Button
              label="Delete Document"
              onPress={onDelete}
              variant="danger"
              loading={deleting}
              disabled={loading}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
    title: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text },
    container: { padding: Spacing.lg, paddingBottom: Spacing.xl * 2, gap: Spacing.md },
  });
}