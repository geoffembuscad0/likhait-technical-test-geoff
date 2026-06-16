/**
 * Form component for adding/editing expenses
 */

import React, { useState, useEffect } from "react";
import { ExpenseFormData } from "../types";
// import { EXPENSE_CATEGORIES } from "../constants/categories";
import { TextField, SelectBox, Button } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { fetchCategories } from "../services/api";
import { AddCategoryModal } from "./AddCategoryModal";
import { COLORS } from "../constants/colors";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const { formData, errors, isSubmitting, handleChange, handleSubmit, today } =
    useExpenseForm({ initialData, onSubmit });

  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCategoryCreated = (categoryName: string) => {
    /**
     * I plan to reload the list from the server so order stays correct, then
     * auto-select the newly created category in the form.
     */
    loadCategories().then(() => {
      handleChange("category", categoryName);
    });
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const categoryRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-end",
    gap: "0.5rem",
  };

  const addCategoryButtonStyle: React.CSSProperties = {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: COLORS.primary.p06,
    background: "transparent",
    border: `1px solid ${COLORS.primary.p06}`,
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    marginBottom: errors.category ? "1.25rem" : "0", // Align button baseline with the select bottom edge
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const dateHintStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    color: COLORS.text.secondary,
    marginTop: "-0.5rem",
  };

  const categoryOptions = categories.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  return (
    <>
      <form onSubmit={handleSubmit} style={formStyle}>
        <TextField
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          error={errors.amount}
          fullWidth
          required
        />

        <TextField
          label="Description"
          type="text"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
          fullWidth
          required
        />

        {/* Category selector and inline "Add Category" button */}
        <div style={categoryRowStyle}>
          <div style={{ flex: 1 }}>
            <SelectBox
              label="Category"
              options={isLoadingCategories ? [] : categoryOptions}
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              error={errors.category}
              fullWidth
              required
              disabled={isLoadingCategories}
            />
          </div>
          <button
            type="button"
            style={addCategoryButtonStyle}
            onClick={() => setIsAddCategoryModalOpen(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.primary.p01;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            title="Create a new category"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="7" y1="1" x2="7" y2="13" />
              <line x1="1" y1="7" x2="13" y2="7" />
            </svg>
            New
          </button>
        </div>

        {/* Date field: max="today" blocks the native date picker calendar from showing future dates, and the hook validates manual typed input too. */}
        <div>
          <TextField
            label="Date"
            type="date"
            value={formData.date}
            max={today}
            onChange={(e) => handleChange("date", e.target.value)}
            error={errors.date}
            fullWidth
            required
          />
          {!errors.date && (
            <p style={dateHintStyle}>You can only record expenses for today or past dates.</p>
          )}
        </div>

        <div style={buttonGroupStyle}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </>
  );
}
