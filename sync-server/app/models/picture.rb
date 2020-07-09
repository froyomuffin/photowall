class Picture < ApplicationRecord
  include Rails.application.routes.url_helpers

  has_one_attached :image

  def source
    rails_blob_path(image, disposition: "attachment", only_path: true)
  end

  def attributes
    super.merge(source: source)
  end
end
