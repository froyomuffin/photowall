SOURCE_DIR = 'import'
IMPORT_URL = 'http://localhost:3000'

task :import => :environment do
  image_file_names = Dir.glob("#{SOURCE_DIR}/*")

  image_file_names.each do |image_file_name|
    puts "Importing #{image_file_name}"

    importPicture(image_file_name)
  end
end

task :destroy_all => :environment do
  Picture.destroy_all
end


private

def importPicture(image_file_name)
  file = File.open(image_file_name)

  magic = Magick::Image.from_blob(file.read).first

  picture = Picture.new

  picture.height = magic.rows
  picture.width = magic.columns

  picture.image.attach(io: File.open(image_file_name), filename: File.basename(image_file_name))

  picture.save
end
