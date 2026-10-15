import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, ThemeColors, Typography } from '../../constants/theme';

interface DateFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  maximumDate?: Date | null;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export function DateField({
  label,
  value,
  onChange,
  maximumDate,
}: DateFieldProps) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);
  const [open, setOpen] = useState(false);
  const resolvedMaximumDate = maximumDate === null ? undefined : maximumDate ?? new Date();

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    setOpen(false);
    if (event.type === 'set' && selected) {
      onChange(selected);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      {Platform.OS === 'ios' ? (
        <View style={styles.iosRow}>
          <DateTimePicker
            value={value}
            mode="date"
            display="compact"
            maximumDate={resolvedMaximumDate}
            themeVariant={isDark ? 'dark' : 'light'}
            onChange={handleChange}
          />
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.field}
            onPress={() => setOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.value}>{formatDate(value)}</Text>
            <Calendar size={18} color={colors.primary} strokeWidth={2.2} />
          </TouchableOpacity>
          {open && (
            <DateTimePicker
              value={value}
              mode="date"
              maximumDate={resolvedMaximumDate}
              onChange={handleChange}
            />
          )}
        </>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: { marginBottom: Spacing.md },
    label: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      color: colors.textSecondary,
      marginBottom: Spacing.xs + 2,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.md,
      backgroundColor: colors.surface,
    },
    value: { fontSize: Typography.size.md, color: colors.text },
    iosRow: { alignItems: 'flex-start' },
  });
}
