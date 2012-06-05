require 'open-uri'

describe 'service' do

  before :all do
    @server = fork do
      exec 'node service.js'
    end
    sleep 0.1
  end

  it 'should return valid favicon for google.com' do
    open("http://localhost:3000/google.com") do |f|
      puts f.read
    end
  end

  after :all do
    Process.kill "TERM", @server
  end

end