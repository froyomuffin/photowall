class Picture < ApplicationRecord
  include Rails.application.routes.url_helpers

  before_create :default_values

  has_one_attached :image

  def source
    rails_blob_path(image, disposition: "attachment", only_path: true)
  end

  def attributes
    super.merge(source: source)
  end

  private

  def default_values
    self.top ||= 0;
    self.left ||= 0;
  end
end
