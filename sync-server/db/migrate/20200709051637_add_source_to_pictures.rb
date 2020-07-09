class AddSourceToPictures < ActiveRecord::Migration[6.0]
  def change
    add_column :pictures, :source, :string
  end
end
