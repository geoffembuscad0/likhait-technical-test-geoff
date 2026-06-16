require 'rails_helper'

RSpec.describe "Api::Categories", type: :request do
  describe "GET /api/categories" do
    let!(:food) { Category.create!(name: "Food") }
    let!(:transport) { Category.create!(name: "Transport") }
    let!(:supplies) { Category.create!(name: "Supplies") }

    it "returns all categories" do
      get "/api/categories"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
      expect(json.map { |c| c["name"] }).to include("Food", "Transport", "Supplies")
    end

    it "returns categories in alphabetical order" do
      get "/api/categories"

      json = JSON.parse(response.body)
      expect(json.map { |c| c["name"] }).to eq([ "Food", "Supplies", "Transport" ])
    end
  end
  # Additional Spec for the added API for Categories Creation
  describe "POST /api/categories" do
    context "with valid parameters" do
      it "creates a new category" do
        expect {
          post "/api/categories", params: { category: { name: "Fitness" } }, as: :json
        }.to change(Category, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Fitness")
      end

      it "returns the created category as JSON" do
        post "/api/categories", params: { category: { name: "Hobbies" } }, as: :json

        json = JSON.parse(response.body)
        expect(json).to include("id", "name", "created_at", "updated_at")
        expect(json["name"]).to eq("Hobbies")
      end
    end

    context "with invalid parameters" do
      it "returns an error when name is blank" do
        post "/api/categories", params: { category: { name: "" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name can't be blank")
      end

      it "returns an error when name exceeds 100 characters" do
        long_name = "A" * 101
        post "/api/categories", params: { category: { name: long_name } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name is too long (maximum is 100 characters)")
      end

      it "returns an error on duplicate category name" do
        Category.create!(name: "Food")
        post "/api/categories", params: { category: { name: "Food" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name has already been taken")
      end

      it "is case-insensitive for duplicate detection" do
        Category.create!(name: "Food")
        post "/api/categories", params: { category: { name: "food" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "does not create a record on failure" do
        expect {
          post "/api/categories", params: { category: { name: "" } }, as: :json
        }.not_to change(Category, :count)
      end
    end
  end
end
