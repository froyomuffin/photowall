class RemoveSourceFromPicture < ActiveRecord::Migration[6.0]
  def change
    remove_column :pictures, :source, :datatype
  end
end
