class Category < ApplicationRecord
  has_many :expenses, dependent: :destroy
  # Added validations for the Model
  validates :name, presence: true,
                   length: { maximum: 100 },
                   uniqueness: { case_sensitive: false }
end