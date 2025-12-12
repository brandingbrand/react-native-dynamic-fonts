require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name                   = "DynamicFonts"

  s.version                = package["version"]
  s.homepage               = package["homepage"]
  s.summary                = package["description"]
  s.license                = package["license"]
  s.author                 = package["author"]
  s.source                 = { :git => package['repository']['url'], :tag => "#{s.version}" }

  s.platforms              = min_supported_versions

  s.source_files           = "ios/**/*.{h,m,mm,swift,cpp}"
  s.private_header_files   = "ios/**/*.h"
  s.frameworks             = 'Foundation', 'UIKit', 'CoreText'

  install_modules_dependencies(s)
end
