require 'open-uri'

describe 'service.js' do

  before :all do
    @server = fork do
      exec 'node service.js'
    end
    sleep 0.2
  end

  let(:google_favicon) { File.read('spec/google-favicon.ico').force_encoding('ascii-8bit') }

  it 'should return valid favicon for google.com' do
    open("http://localhost:3000/www.google.com") do |f|
      f.content_type.should == 'image/x-icon'
      f.read.should == google_favicon
    end
  end

  after :all do
    Process.kill "TERM", @server
  end

end