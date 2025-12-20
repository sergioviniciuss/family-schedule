'use client';

import * as React from 'react';
import { Location } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LocationFormProps {
  location?: Location;
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LocationForm = ({ location, onSave, onCancel, isLoading }: LocationFormProps) => {
  const [name, setName] = React.useState(location?.name || '');
  const [color, setColor] = React.useState(location?.color || '#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), color);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Location Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          placeholder="e.g., Parents, In-laws, Hotel"
        />
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium mb-1">
          Color
        </label>
        <div className="flex gap-2 items-center">
          <Input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={isLoading}
            className="w-20 h-10 cursor-pointer"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={isLoading}
            placeholder="#3b82f6"
            pattern="^#[0-9A-Fa-f]{6}$"
            className="flex-1"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading || !name.trim()}>
          {isLoading ? 'Saving...' : location ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

