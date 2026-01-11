'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RiskMatrixProps {
  frequency: number;
  probability: number;
  severity: number;
  control: number;
  onFrequencyChange: (value: number) => void;
  onProbabilityChange: (value: number) => void;
  onSeverityChange: (value: number) => void;
  onControlChange: (value: number) => void;
}

const cotationLabels = {
  frequency: {
    1: 'Rare (moins d\'une fois par an)',
    2: 'Occasionnelle (plusieurs fois par an)',
    3: 'Fréquente (plusieurs fois par mois)',
    4: 'Permanente (quotidienne)',
  },
  probability: {
    1: 'Très faible',
    2: 'Faible',
    3: 'Moyenne',
    4: 'Élevée',
  },
  severity: {
    1: 'Bénin (sans arrêt de travail)',
    2: 'Léger (arrêt de travail < 3 jours)',
    3: 'Grave (arrêt de travail > 3 jours)',
    4: 'Très grave (incapacité permanente ou décès)',
  },
  control: {
    1: 'Très bonne maîtrise',
    2: 'Bonne maîtrise',
    3: 'Maîtrise partielle',
    4: 'Maîtrise insuffisante',
  },
};

export function RiskMatrix({
  frequency,
  probability,
  severity,
  control,
  onFrequencyChange,
  onProbabilityChange,
  onSeverityChange,
  onControlChange,
}: RiskMatrixProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>Fréquence (F)</Label>
        <Select
          value={frequency.toString()}
          onValueChange={(value) => onFrequencyChange(Number(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value} - {cotationLabels.frequency[value as keyof typeof cotationLabels.frequency]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Probabilité (P)</Label>
        <Select
          value={probability.toString()}
          onValueChange={(value) => onProbabilityChange(Number(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value} - {cotationLabels.probability[value as keyof typeof cotationLabels.probability]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Gravité (G)</Label>
        <Select
          value={severity.toString()}
          onValueChange={(value) => onSeverityChange(Number(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value} - {cotationLabels.severity[value as keyof typeof cotationLabels.severity]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Maîtrise (M)</Label>
        <Select
          value={control.toString()}
          onValueChange={(value) => onControlChange(Number(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value} - {cotationLabels.control[value as keyof typeof cotationLabels.control]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

