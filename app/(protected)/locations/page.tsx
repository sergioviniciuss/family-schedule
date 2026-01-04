'use client';

import * as React from 'react';
import { Location } from '@/types';
import { LocationForm } from '@/components/locations/LocationForm';
import { LocationBadge } from '@/components/ui/LocationBadge';
import { Button } from '@/components/ui/Button';

export default function LocationsPage() {
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [editingLocation, setEditingLocation] = React.useState<Location | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreate = async (name: string, color: string) => {
    setSaving(true);
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      });

      if (response.ok) {
        await fetchLocations();
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create location');
      }
    } catch (error) {
      console.error('Error creating location:', error);
      alert('Failed to create location');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (name: string, color: string) => {
    if (!editingLocation) return;

    setSaving(true);
    try {
      const response = await fetch('/api/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingLocation.id, name, color }),
      });

      if (response.ok) {
        await fetchLocations();
        setEditingLocation(null);
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Failed to update location');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/locations?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchLocations();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Failed to delete location');
    } finally {
      setDeleting(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLocation(null);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Locations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage the places where you sleep during your trips
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Add Location</Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </h2>
          <LocationForm
            location={editingLocation || undefined}
            onSave={editingLocation ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            isLoading={saving}
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Your Locations
          </h2>
          {locations.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No locations yet. Add your first location to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <LocationBadge location={location} size="lg" />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(location)}
                      disabled={deleting === location.id}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(location.id)}
                      disabled={deleting === location.id}
                    >
                      {deleting === location.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
