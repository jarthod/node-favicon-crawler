require 'open-uri'

describe 'service.js' do

  before :all do
    @server = fork do
      exec 'node service.js'
    end
    sleep 0.2
  end

  let(:google_favicon) { File.read('spec/google-favicon.ico').force_encoding('ascii-8bit') }
  let(:google_icon) { File.read('spec/google-icon.png').force_encoding('ascii-8bit') }
  let(:dashlane_icon) { File.read('spec/dashlane.ico').force_encoding('ascii-8bit') }
  let(:wopata_icon) { File.read('spec/wopata.png').force_encoding('ascii-8bit') }

  it 'should return valid icon for google.com' do
    open("http://localhost:3000/www.google.com") do |f|
      f.content_type.should == 'image/png'
      f.read.should == google_icon
    end
  end

  it 'should follow redirect during favicon fetching' do
    open("http://localhost:3000/google.com") do |f|
      f.content_type.should == 'image/png'
      f.read.should == google_icon
    end
  end

  it 'should return valid icon for dashlane.com' do
    open("http://localhost:3000/dashlane.com") do |f|
      f.content_type.should == 'image/x-icon'
      f.read.should == dashlane_icon
    end
  end

  it 'should fetch apple-touch-icon' do
    open("http://localhost:3000/wopata.com") do |f|
      f.content_type.should == 'image/png'
      f.read.should == wopata_icon
    end
  end

  it 'should return 404 when no favicon available' do
    expect {
      open("http://localhost:3000/www.rixml.org")      
    }.to raise_error(OpenURI::HTTPError)
  end

  after :all do
    Process.kill "TERM", @server
  end

end