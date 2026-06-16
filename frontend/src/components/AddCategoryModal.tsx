/**
 * My New Modal for the creation of Category Modal
 */

import React, { useState } from "react";
import { Modal, TextField, Button } from "../vibes";
import { createCategory } from "../services/api";
import { COLORS } from "../constants/colors";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the newly created category name so the parent can select it */
  onCategoryCreated: (categoryName: string) => void;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onCategoryCreated,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setName("");
    setError(undefined);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required");
      return;
    }
    if (trimmed.length > 100) {
      setError("Category name must be 100 characters or fewer");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      const created = await createCategory(trimmed);
      onCategoryCreated(created.name);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hintStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    color: COLORS.text.secondary,
    marginTop: "-0.25rem",
  };

  const footerStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    justifyContent: "flex-end",
    marginTop: "1.5rem",
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Category">
      <form onSubmit={handleSubmit}>
        <TextField
          label="Category Name"
          type="text"
          placeholder="e.g. Subscriptions"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(undefined);
          }}
          error={error}
          fullWidth
          required
          autoFocus
          maxLength={100}
        />
        <p style={hintStyle}>Maximum 100 characters. Must be unique.</p>

        <div style={footerStyle}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Add Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
