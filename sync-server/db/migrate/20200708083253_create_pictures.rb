class CreatePictures < ActiveRecord::Migration[6.0]
  def change
    create_table :pictures do |t|
      t.integer :left
      t.integer :top
      t.integer :width
      t.integer :height

      t.timestamps
    end
  end
end
