require 'rails_helper'

RSpec.describe Expense, type: :model do
    # My Description of my Expense date validations
  let(:category) { Category.create!(name: "Food") }

  describe "date validations" do
    it "is valid with today's date" do
      expense = Expense.new(
        description: "Lunch",
        amount: 10.00,
        category: category,
        date: Date.current
      )
      expect(expense).to be_valid
    end

    it "is valid with a past date" do
      expense = Expense.new(
        description: "Lunch",
        amount: 10.00,
        category: category,
        date: Date.current - 7
      )
      expect(expense).to be_valid
    end

    it "is invalid with a future date" do
      expense = Expense.new(
        description: "Lunch",
        amount: 10.00,
        category: category,
        date: Date.current + 1
      )
      expect(expense).not_to be_valid
      expect(expense.errors[:date]).to include(
        "cannot be in the future. Please select today or a past date."
      )
    end

    it "is invalid when date is far in the future" do
      expense = Expense.new(
        description: "Lunch",
        amount: 10.00,
        category: category,
        date: Date.current + 365
      )
      expect(expense).not_to be_valid
      expect(expense.errors[:date]).to be_present
    end

    it "skips the future date check when date is blank" do
      expense = Expense.new(
        description: "Lunch",
        amount: 10.00,
        category: category,
        date: nil
      )
      # presence validation fires, not the custom one
      expect(expense.errors[:date]).not_to include(
        "cannot be in the future. Please select today or a past date."
      )
    end
  end
end