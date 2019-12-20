require 'erubi'

Dir.glob('pages/*.html.erb').each do |page_path|
  content = eval(Erubi::Engine.new(File.read(page_path)).src)
  content = eval(Erubi::Engine.new(File.read('page.html.erb')).src)

  File.write('../' + page_path.split('/')[1].split('.')[0] + '.html', content)
end
